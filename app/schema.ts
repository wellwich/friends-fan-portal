import { z } from 'zod';

// ニュースデータのスキーマ定義
const newsSchema = z.object({
    targetUrl: z.string(),
    title: z.string(),
    newsDate: z.string(),
    updated: z.string(),
});

// ニュースデータの配列のスキーマ
const newsArraySchema = z.array(newsSchema);

// zod to type
type News = z.infer<typeof newsSchema>;

// スキーマ定義を更新
const videoSchema = z.object({
    thumbnail: z.string(), // "thumbnailDefault"から"thumbnail"に変更
    title: z.string(),
    publishedAt: z.string(),
    videoId: z.string()
});

// 動画データの配列のスキーマ
const videoArraySchema = z.array(videoSchema);

// zod to type
type Video = z.infer<typeof videoSchema>;

export { newsArraySchema, videoArraySchema, News, Video };