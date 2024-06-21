import { useEffect, useState } from "hono/jsx";
import { z } from "zod";

const newsSchema = z.object({
    targetUrl: z.string(),
    title: z.string(),
    newsDate: z.string(),
    updated: z.string(),
});

const newsArraySchema = z.array(newsSchema);

const KemonoFriends3NewsSearch = () => {
    const [newsData, setNewsData] = useState<Array<{ title: string, newsDate: string, updated: string, targetUrl: string }>>([]);
    const [allNewsData, setAllNewsData] = useState<Array<{ title: string, newsDate: string, updated: string, targetUrl: string }>>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [displayLimit, setDisplayLimit] = useState(10);
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortField, setSortField] = useState("newsDate");


    useEffect(() => {
        fetch('/api/kf3-news')
            .then(res => res.json())
            .then(data => {
                const result = newsArraySchema.safeParse(data);
                if (result.success) {
                    setAllNewsData(result.data);
                    setNewsData(sortNewsData(result.data.slice(0, displayLimit), sortOrder, sortField));
                } else {
                    console.error("Data validation failed", result.error);
                }
            });
    }, []);

    const handleSearchChange = (event: Event) => {
        if (event.target instanceof HTMLInputElement) {
            setSearchKeyword(event.target.value);
        }
    };

    const handleSearch = () => {
        const filteredNews = allNewsData.filter(news => news.title.includes(searchKeyword));
        setNewsData(sortNewsData(filteredNews, sortOrder, sortField).slice(0, displayLimit));
    };

    const handleLoadMore = () => {
        setDisplayLimit(prevLimit => prevLimit + 10);
        setNewsData(sortNewsData(allNewsData, sortOrder, sortField).slice(0, displayLimit + 10));
    };

    const handleSortOrderChange = (event: Event) => {
        if (event.target instanceof HTMLSelectElement) {
            const newSortOrder = event.target.value;
            console.log(newSortOrder);
            // ソート順を更新
            setSortOrder(newSortOrder);
        }
    };

    function parseDateString(dateString: string): number {
        const regex = /(\d{4})年(\d{2})月(\d{2})日 (\d{2})時(\d{2})分(\d{2})秒/;
        const match = dateString.match(regex);

        if (!match) {
            throw new Error("Invalid date string format");
        }

        const [_, year, month, day, hours, minutes, seconds] = match;

        const date = new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            parseInt(hours, 10),
            parseInt(minutes, 10),
            parseInt(seconds, 10)
        );

        return date.getTime();
    }

    const sortNewsData = (data: Array<{ title: string, newsDate: string, updated: string, targetUrl: string }>, sortOrder: string, sortField: string) => {
        return data.sort((a, b) => {
            if (sortField === "updated") {
                if (sortOrder === "asc") {
                    return new Date(a.updated).getTime() - new Date(b.updated).getTime();
                } else {
                    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
                }
            } else if (sortField === "newsDate") {
                if (sortOrder === "asc") {
                    return parseDateString(a.newsDate) - parseDateString(b.newsDate);
                } else {
                    return parseDateString(b.newsDate) - parseDateString(a.newsDate);
                }
            }
            return 0;
        });
    };

    const handleDisplayLimitChange = (event: Event) => {
        if (event.target instanceof HTMLInputElement) {
            const newDisplayLimit = event.target.value;
            if (newDisplayLimit === "all") {
                setDisplayLimit(allNewsData.length);
            } else {
                setDisplayLimit(Number(newDisplayLimit));
            }
        }
    };



    const handleSortFieldChange = (event: Event) => {
        if (event.target instanceof HTMLSelectElement) {
            setSortField(event.target.value);
        }
    };

    return (
        <div class="flex flex-col bg-white p-4 m-4 rounded-md">
            <h2 class="text-3xl font-bold">お知らせ検索</h2>
            <div>
                <div>
                    <label for="sortOrder">ソート順:</label>
                    <select id="sortOrder" value={sortOrder} onChange={handleSortOrderChange}>
                        <option value="desc">新しい順</option>
                        <option value="asc">古い順</option>
                    </select>
                </div>
                <div>
                    <label for="sortField">ソート基準:</label>
                    <select id="sortField" value={sortField} onChange={handleSortFieldChange}>
                        <option value="newsDate">投稿日</option>
                        <option value="updated">更新日</option>
                    </select>
                </div>
                <div>
                    <input type="radio" id="limit10" name="displayLimit" value="10" checked={displayLimit === 10} onChange={handleDisplayLimitChange} />
                    <label for="limit10">10件</label>
                    <input type="radio" id="limit50" name="displayLimit" value="50" checked={displayLimit === 50} onChange={handleDisplayLimitChange} />
                    <label for="limit50">50件</label>
                    <input type="radio" id="limit100" name="displayLimit" value="100" checked={displayLimit === 100} onChange={handleDisplayLimitChange} />
                    <label for="limit100">100件</label>
                    <input type="radio" id="limitAll" name="displayLimit" value="all" checked={displayLimit === allNewsData.length} onChange={handleDisplayLimitChange} />
                    <label for="limitAll">全件</label>
                </div>
            </div>
            <input type="text" class="p-2 m-2 border border-gray-600 rounded-md" placeholder="検索" value={searchKeyword} onChange={handleSearchChange} />
            <button class="p-2 m-2 border border-gray-600 rounded-md bg-blue-500 text-white" onClick={handleSearch}>検索</button>
            <ul class="">
                {newsData.map((news, index) => (
                    <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                        <a href={"https://kemono-friends-3.jp" + news.targetUrl} target="_blank" class="flex flex-col justify-between">
                            <p class="h-16 overflow-hidden text-base">{news.title}</p>
                            <span class="text-xs mt-auto">{news.newsDate.slice(0, 10)}</span>
                        </a>
                    </li>
                ))}
            </ul>
            {allNewsData.length > displayLimit && (
                <button class="p-2 m-2 border border-gray-600 rounded-md bg-blue-500 text-white" onClick={handleLoadMore}>もっと見る</button>
            )}
        </div>
    );
};

export default KemonoFriends3NewsSearch;