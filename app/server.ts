import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { newsArraySchema, videoArraySchema } from './schema'
import { drizzle } from 'drizzle-orm/d1'
import { threads, posts } from './db/schema'
import { desc, eq } from 'drizzle-orm'

const app = createApp()

showRoutes(app)

app.get('/api/kf3-news', async (c) => {
    const cacheKey = "kf3-news";
    const cachedData = await c.env.KF3_API_CACHE.get(cacheKey);
    if (cachedData) {
        console.log('cache hit:', cacheKey);
        return c.json(JSON.parse(cachedData));
    }
    const url = "https://kemono-friends-3.jp/info/app/info/entries.txt";
    const res = await fetch(url);
    const body = await res.text();

    const jsonData = JSON.parse(body);

    const arrayData = jsonData.news;

    // ニュースデータを日付の新しい順に並び替え
    arrayData.sort((a: any, b: any) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());

    const extractData = newsArraySchema.safeParse(arrayData);

    if (!extractData.success) {
        // バリデーションエラーの詳細をログに出力
        console.error(extractData.error);
        return c.json({ error: "Invalid data format" }, 400);
    }
    await c.env.KF3_API_CACHE.put(cacheKey, JSON.stringify(extractData.data), { expirationTtl: 60 * 60 });
    return c.json(extractData.data);
});

interface YouTubeApiResponseItem {
    id: {
        kind: string;
        videoId: string;
    };
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            };
            medium: {
                url: string;
                width: number;
                height: number;
            };
            high: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        liveBroadcastContent: string;
        publishTime: string;
    };
}

// YouTube APIからのレスポンスアイテムを整形するための型定義
interface FormattedYouTubeItem {
    videoId: string;
    title: string;
    publishedAt: string;
    thumbnail: string;
}

// YouTube APIのレスポンス全体を表す型
interface YouTubeApiResponse {
    items: YouTubeApiResponseItem[];
}


// youtube apiを使って、けものフレンズ３の公式youtubeチャンネルの最新動画を取得
app.get('/api/kfv-youtube', async (c) => {
    const channelIds = c.req.queries("channelIds");
    if (!channelIds) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    // youtube apiを使ってデータを取得
    const youtubeDataArray = await Promise.all(channelIds.map(async (channelId) => {
        const cacheKey = `kfv-youtube_${channelId}`;
        const cachedData = await c.env.KFV_API_CACHE.get(cacheKey);
        if (cachedData) {
            console.log('cache hit:', cacheKey);
            return JSON.parse(cachedData);
        }
        const YOUTUBE_API_KEY = c.env.YOUTUBE_API_KEY;
        const youtubeData: any = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&key=${YOUTUBE_API_KEY}`,
        ).then((response) => {
            return response.json();
        });
        // 取得したデータをキャッシュ
        await c.env.KFV_API_CACHE.put(cacheKey, JSON.stringify(youtubeData), { expirationTtl: 60 * 60 });
        return youtubeData;
    }
    ));

    // youtubeDataArray.flatMapの中で使用する型をYouTubeApiResponseに変更
    const items = youtubeDataArray.flatMap((youtubeData: YouTubeApiResponse) => {
        // youtubeData.itemsが存在し、配列であることを確認
        if (!youtubeData.items || !Array.isArray(youtubeData.items)) {
            console.error('youtubeData.items is undefined or not an array', youtubeData);
            return []; // 空の配列を返して、flatMapの処理を続行
        }
        return youtubeData.items.map((item: YouTubeApiResponseItem): FormattedYouTubeItem => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.medium.url
        }));
    });

    // youtube apiから取得したデータを日付の新しい順に並び替え
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const extractData = videoArraySchema.safeParse(items);

    if (!extractData.success) {
        // バリデーションエラーの詳細をログに出力
        console.error(extractData.error);
        return c.json({ error: "Invalid data format" }, 400);
    }
    return c.json(extractData.data); // 正しいデータを返す
});

/*
掲示板
*/

app.get('/api/threads', async (c) => {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(threads).limit(10).orderBy(desc(threads.createdAt)).execute();
    const threadsData = result.map((record) => {
        return {
            id: record.id,
            title: record.title,
            createdAt: record.createdAt,
        }
    });
    return c.json(threadsData);
});

app.get('/api/thread/:threadId', async (c) => {
    const threadId = c.req.param("threadId");
    if (!threadId) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const threadIdDate = parseInt(threadId, 10);
    if (isNaN(threadIdDate)) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const db = drizzle(c.env.DB);
    const result = await db.select().from(threads).where(eq(threads.id, threadIdDate)).execute();
    if (result.length === 0) {
        return c.json({ error: "Thread not found" }, 404);
    }
    return c.json(result);
});

export default app