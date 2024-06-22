import { useEffect, useState } from "hono/jsx";
import { newsArraySchema } from "../schema";

const KemonoFriends3 = () => {
    const [newsData, setNewsData] = useState<Array<{ title: string, newsDate: string, targetUrl: string }>>([
        { title: "読み込み中", newsDate: "2015年03月16日", targetUrl: "" },
        { title: "読み込み中", newsDate: "2015年03月16日", targetUrl: "" },
        { title: "読み込み中", newsDate: "2015年03月16日", targetUrl: "" },
        { title: "読み込み中", newsDate: "2015年03月16日", targetUrl: "" }
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/kf3-news')
            .then(res => res.json())
            .then(data => {
                const result = newsArraySchema.safeParse(data);
                if (result.success) {
                    // バリデーション成功
                    // result.dataを6データまでに絞る
                    setNewsData(result.data.slice(0, 4));
                } else {
                    // バリデーション失敗
                    console.error("Data validation failed", result.error);
                }
                setIsLoading(false); // 追加
            });
    }, []);

    return (
        <div class="m-4 p-4 bg-white rounded-md">
            <h2 class="text-3xl font-bold">
                <a href="/kemono-friends-3">けものフレンズ３</a>
            </h2>
            <ul class="grid grid-cols-2 md:grid-cols-4">
                {isLoading ? (
                    newsData.map((_, index) => (
                        <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                            <div class="flex flex-col justify-between">
                                <p class="h-24 overflow-hidden text-base">{_.title}</p>
                                <span class="text-xs mt-auto">{_.newsDate}</span>
                            </div>
                        </li>
                    ))
                ) : (
                    newsData.map((news, index) => (
                        <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                            <a href={"https://kemono-friends-3.jp" + news.targetUrl} target="_blank" class="flex flex-col justify-between">
                                <p class="h-24 overflow-hidden text-base">{news.title}</p>
                                <span class="text-xs mt-auto">{news.newsDate.slice(0, 12)}</span>
                            </a>
                        </li>
                    ))
                )}
            </ul>
        </div >
    );
};
export default KemonoFriends3;