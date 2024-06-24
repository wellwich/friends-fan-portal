import { useState, useEffect } from "hono/jsx"
import { ThreadsData } from "../types";
import dayjs from "dayjs";

const ThreadsList = () => {
    const [threadData, setThreadData] = useState<ThreadsData[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const threadData = await fetch("/api/threads");
            const threadJson: ThreadsData[] = await threadData.json();
            setThreadData(threadJson);

        }
        fetchData();
    }, []);

    const [title, setTitle] = useState('');

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const threadTitle = { title };
        const response = await fetch('/api/new-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(threadTitle)
        });
        if (response.ok) {
            const threadJson: ThreadsData = await response.json();
            setThreadData([threadJson, ...threadData]);
            setTitle('');
        } else {
            console.error('Failed to add thread');
        }
    };

    return (
        <div class="flex flex-col bg-white p-4 m-4 rounded-lg">
            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onInput={(e: Event) => setTitle((e.target as HTMLInputElement).value)} class="border border-gray-600 rounded-md p-2 m-2" />
                <button
                    class="p-2 m-2 border border-gray-600 rounded-md text-white bg-blue-500"
                    type="submit">スレッドを作成</button>
            </form>
            <h1 class="text-2xl font-bold">
                スレッド一覧
            </h1>
            <ul>
                {threadData.map((thread, index) => (
                    <li key={index} class="p-2 m-2 hover:shadow-xl border border-gray-600 rounded-md">
                        <a href={`/community/threads/${thread.id}`} class="flex flex-col">
                            <h2 class="text-xl font-bold">
                                {thread.title}
                            </h2>
                            <div class="flex flex-row justify-end">
                                <span>
                                    {thread.updatedAt ? `最終更新日時: ${dayjs(thread.updatedAt).format('YYYY/MM/DD HH:mm:ss')}` : 'まだ更新されていません'}
                                </span>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div >
    );
}

export default ThreadsList;