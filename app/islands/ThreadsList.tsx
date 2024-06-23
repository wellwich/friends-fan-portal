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


    return (
        <div>
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