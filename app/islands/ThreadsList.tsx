import { useState, useEffect } from "hono/jsx"
import { ThreadsData } from "../types";

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
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onInput={(e: Event) => setTitle((e.target as HTMLInputElement).value)} />
                <button type="submit">スレッドを作成</button>
            </form>
            <h1>スレッド一覧</h1>
            <ul>
                {threadData.map((thread, index) => (
                    <li key={index}>
                        <a href={`/community/threads/${thread.id}`}>{thread.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ThreadsList;