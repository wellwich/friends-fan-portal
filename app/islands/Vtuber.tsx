import { useEffect, useState } from "hono/jsx"; // "hono/jsx"から"react"に変更
import { z } from "zod";
import dayjs from "dayjs";

const dummy = "/static/dummy.webp";

// スキーマ定義を更新
const videoSchema = z.object({
    thumbnail: z.string(), // "thumbnailDefault"から"thumbnail"に変更
    title: z.string(),
    publishedAt: z.string(),
    videoId: z.string()
});

const videoArraySchema = z.array(videoSchema);

const Vtuber = () => {
    const defaultArray = [
        { thumbnail: dummy, title: "読み込み中…", publishedAt: "2015年03月16日", videoId: "" },
        { thumbnail: dummy, title: "読み込み中…", publishedAt: "2015年03月16日", videoId: "" },
        { thumbnail: dummy, title: "読み込み中…", publishedAt: "2015年03月16日", videoId: "" },
        { thumbnail: dummy, title: "読み込み中…", publishedAt: "2015年03月16日", videoId: "" }
    ];
    const [vtuberData, setVtuberData] = useState<Array<{ thumbnail: string, title: string, publishedAt: string, videoId: string }>>(defaultArray);
    const [isLoading, setIsLoading] = useState(true);

    const channelIds = [
        "UCnyE-wD1pE2GZOxA6OHjW9g", // ウサギコウモリ
        "UCabMjG8p6G5xLkPJgEoTnDg", // コヨーテ
        "UCmYO-WfY7Tasry4D1YB4LJw", // フンボルトペンギン
        "UCMpw36mXEu3SLsqdrJxUKNA", // シマハイイロギツネ
    ];

    useEffect(() => {
        const params = new URLSearchParams();
        channelIds.forEach(id => params.append("channelIds", id));
        const queryString = params.toString();
        fetch(`/api/kfv-youtube?${queryString}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`API call failed with status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const result = videoArraySchema.safeParse(data);
                if (result.success && result.data?.length > 0) {
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
                {isLoading && vtuberData == defaultArray ? (
                    vtuberData.map((_, index) => (
                        <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                            <div class="flex flex-col justify-between">
                                <div
                                    className="w-24 h-24 rounded-full border-8 border-blue-500 animate-spin m-auto"
                                    style={{ borderTopColor: 'transparent' }}
                                />
                                <p class="h-24 overflow-hidden text-base"></p>
                            </div>
                        </li>
                    ))
                ) : (
                    vtuberData.map((vtuber, index) => (
                        <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                            {vtuber.title === "読み込み中…" ? (
                                <>
                                    <div
                                        className="w-24 h-24 rounded-full border-8 border-blue-500 animate-spin m-auto"
                                        style={{ borderTopColor: 'transparent' }}
                                    />
                                    <div
                                        className="h-24"
                                    />
                                </>
                            ) : (
                                <>
                                    <a href={"https://www.youtube.com/watch?v=" + vtuber.videoId} target="_blank" class="flex flex-col justify-between">
                                        <img src={vtuber.thumbnail} alt={vtuber.title} class="h-24 w-full object-cover" />
                                        <p class="h-24 overflow-hidden text-base">{vtuber.title}</p>
                                        <span class="text-xs mt-auto">{vtuber.publishedAt.slice(0, 10)}</span>
                                    </a>
                                </>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default Vtuber;