import { useEffect, useState } from "hono/jsx"; // "hono/jsx"から"react"に変更
import { z } from "zod";
import dayjs from "dayjs";

// スキーマ定義を更新
const videoSchema = z.object({
    thumbnail: z.string(), // "thumbnailDefault"から"thumbnail"に変更
    title: z.string(),
    publishedAt: z.string(),
    videoId: z.string()
});

const videoArraySchema = z.array(videoSchema);

const Vtuber = () => {
    const [vtuberData, setVtuberData] = useState<Array<{ thumbnail: string, title: string, publishedAt: string, videoId: string }>>([
        { thumbnail: "", title: "読み込み中", publishedAt: "2015年03月16日", videoId: "" },
        { thumbnail: "", title: "読み込み中", publishedAt: "2015年03月16日", videoId: "" },
        { thumbnail: "", title: "読み込み中", publishedAt: "2015年03月16日", videoId: "" },
        { thumbnail: "", title: "読み込み中", publishedAt: "2015年03月16日", videoId: "" }
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/kemov-youtube')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`API call failed with status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const result = videoArraySchema.safeParse(data);
                if (result.success) {
                    const formattedData = result.data.map((video: any) => ({
                        ...video,
                        publishedAt: dayjs(video.publishedAt).format("YYYY年MM月DD日")
                    }));
                    setVtuberData(formattedData.slice(0, 4));
                } else {
                    console.error("Data validation failed", result.error);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error("API call error:", error);
                setIsLoading(false);
            });
    }, []);

    return (
        <div class="m-4 p-4 bg-white rounded-md">
            <h2 class="text-3xl font-bold">
                <a href="/vtuber">VTuber</a>
            </h2>
            <ul class="grid grid-cols-2 md:grid-cols-4">
                {isLoading ? (
                    vtuberData.map((_, index) => (
                        <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                            <div class="flex flex-col justify-between">
                                <img src="/dummy.webp" alt="dummy" class="h-24 w-full object-cover" />
                                <p class="h-24 overflow-hidden text-xl">{_.title}</p>
                                <span class="text-xs mt-auto">{_.publishedAt.slice(0, 10)}</span>
                            </div>
                        </li>
                    ))
                ) : (
                    vtuberData.map((vtuber, index) => (
                        <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                            <a href={"https://www.youtube.com/watch?v=" + vtuber.videoId} target="_blank" class="flex flex-col justify-between">
                                <img src={vtuber.thumbnail} alt={vtuber.title} class="h-24 w-full object-cover" /> {/* "thumbnailDefault"から"thumbnail"に変更 */}
                                <p class="h-24 overflow-hidden text-base">{vtuber.title}</p>
                                <span class="text-xs mt-auto">{vtuber.publishedAt.slice(0, 10)}</span>
                            </a>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default Vtuber;