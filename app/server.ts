import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { z } from "zod";

const app = createApp()

showRoutes(app)

// kemono-friends-3の公式サイトからニュースデータを取得
const newsItemSchema = z.object({
    id: z.number(),
    targetUrl: z.string(),
    title: z.string(),
    newsDate: z.string(),
    updated: z.string(),
    category: z.string()
});

const newsSchema = z.object({
    news: z.array(newsItemSchema)
});

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
    const parseResult = newsSchema.safeParse(JSON.parse(body));

    if (!parseResult.success) {
        // バリデーション失敗
        return c.json({ error: "Invalid data format" }, 400);
    }

    const jsonData = parseResult.data;

    // ニュース項目からタイトル、日付、targetUrlを抽出
    const newsData = jsonData.news.map(newsItem => ({
        title: newsItem.title,
        newsDate: newsItem.newsDate,
        targetUrl: newsItem.targetUrl
    }));

    const sliceNewsData = newsData.slice(0, 25);
    // ニュースデータを日付の新しい順に並び替え
    sliceNewsData.sort((a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());

    await c.env.KF3_API_CACHE.put(cacheKey, JSON.stringify(sliceNewsData), { expirationTtl: 60 * 60 });
    return c.json(sliceNewsData);
});


// バーチャルYouTuberの公式youtubeチャンネルから最新動画を取得
const videoSchema = z.object({
    thumbnail: z.string(), // "thumbnailDefault"から"thumbnail"に変更
    title: z.string(),
    publishedAt: z.string(),
    videoId: z.string()
});

const videoArraySchema = z.array(videoSchema);

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
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=16&key=${YOUTUBE_API_KEY}`,
        ).then((response) => {
            return response.json();
        });
        // 取得したデータをキャッシュ
        await c.env.KFV_API_CACHE.put(cacheKey, JSON.stringify(youtubeData), { expirationTtl: 60 * 60 });
        return youtubeData;
    }
    ));

    // youtube apiから取得したデータを整形
    const items = youtubeDataArray.flatMap((youtubeData: any) => {
        // youtubeData.itemsが存在し、配列であることを確認
        if (!youtubeData.items || !Array.isArray(youtubeData.items)) {
            console.error('youtubeData.items is undefined or not an array', youtubeData);
            return []; // 空の配列を返して、flatMapの処理を続行
        }
        return youtubeData.items.map((item: any) => ({
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

export default app