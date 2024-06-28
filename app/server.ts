import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { newsArraySchema, videoArraySchema } from './schema'
import { drizzle } from 'drizzle-orm/d1'
import { threads, posts } from './db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import dayjs from 'dayjs'
import { HTTPException } from 'hono/http-exception';

type TurnstileResult = {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    'error-codes': Array<string>;
    action: string;
    cdata: string;
}

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



const ip2id = (ip: string) => {
    const UnixTime = new Date().getTime();
    const UnixDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    console.log(UnixTime);
    // IPアドレスをバイト配列に変換
    const ipParts = ip.split('.').map(part => parseInt(part, 10));

    // 簡単なハッシュ化
    let hash = 0;
    for (let i = 0; i < ipParts.length; i++) {
        hash = (hash << 5) - hash + ipParts[i];
        hash |= 0; // 32bit整数を維持
    }

    hash *= parseInt(UnixDate, 10);

    // ハッシュ値を文字列に変換
    const hashString = Math.abs(hash).toString(36);

    // 9桁のIDを取得（足りない場合は0で埋める）
    const id = hashString.padStart(9, '0').substring(0, 9);

    return id;
}


app.get('/api/threads', async (c) => {
    const db = drizzle(c.env.DB);
    const result = await db.select()
        .from(threads)
        .limit(10)
        .orderBy(desc(threads.createdAt))
        .execute();
    const threadsData = result.map((record) => {
        return {
            id: record.id,
            title: record.title,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        }
    });
    // スレッドの最後の投稿の日付を取得
    for (let i = 0; i < threadsData.length; i++) {
        const threadId = threadsData[i].id;
        const result = await db.select()
            .from(posts)
            .where(eq(posts.threadId, threadId))
            .orderBy(desc(posts.createdAt))
            .limit(1)
            .execute();
        if (result.length > 0) {
            threadsData[i].updatedAt = result[0].createdAt;
        }
    }
    return c.json(threadsData);
});

app.get('/api/threads/:threadId', async (c) => {
    const threadId = parseInt(c.req.param("threadId"));
    if (!threadId) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const db = drizzle(c.env.DB);
    const result = await db.select()
        .from(posts)
        .where(eq(posts.threadId, threadId))
        .orderBy(asc(posts.createdAt))
        .execute();
    const postsData = result.map((record) => {
        return {
            postId: record.postId,
            name: record.name,
            content: record.content,
            createdAt: record.createdAt,
            id: ip2id(record.ipAddr),
        }
    });
    return c.json(postsData);
});

app.post('/api/new-thread', async (c) => {
    const body = await c.req.json() as { title: string };
    if (!body) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const db = drizzle(c.env.DB);
    if (body.title === undefined) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    // ipからidを生成
    const ip = c.req.header('cf-connecting-ip') ?? '127.0.0.1';
    const UnixTime = new Date().getTime();
    const id = ip2id(ip);

    const result = await db
        .insert(threads)
        .values({
            id: UnixTime,
            title: body.title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ipAddr: ip,
        })
        .returning({ insertedId: threads.id })
        .execute();
    return c.json({ createdBy: id, id: result[0].insertedId, title: body.title });
});

app.post('/api/new-post', async (c) => {
    const body = await c.req.json() as { threadId: string, name: string, content: string };
    if (!body) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
    console.log(ip);
    const db = drizzle(c.env.DB);
    if (body.threadId === undefined || body.name === undefined || body.content === undefined) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const threadId = parseInt(body.threadId, 10);
    if (isNaN(threadId)) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const id = ip2id(ip);
    const result = await db
        .insert(posts)
        .values({
            threadId: threadId,
            name: body.name,
            content: body.content,
            createdAt: new Date().toISOString(),
            ipAddr: ip,
        })
        .returning({ postId: posts.postId, createdAt: posts.createdAt, name: posts.name, content: posts.content, threadId: posts.threadId })
        .execute();
    console.log(result);
    return c.json({ id: id, postId: result[0].postId, createdAt: result[0].createdAt, name: result[0].name, content: result[0].content, threadId: result[0].threadId });
});


app.post('/api/turnstile', async (c) => {
    const body = await c.req.json() as { token: string };
    if (!body) {
        return c.json({ error: "Invalid parameter" }, 400);
    }
    const token = body.token;
    const secret = c.env.TURNSTILE_SECRET_KEY;
    const siteKey = c.env.TURNSTILE_SITE_KEY;
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secret}&response=${token}&sitekey=${siteKey}`
    });
    const data = await response.json() as TurnstileResult;
    if (!data.success) {
        throw new HTTPException(401, {
            message: JSON.stringify(data),
        });
    }
    return c.json({ success: true });
});

export default app