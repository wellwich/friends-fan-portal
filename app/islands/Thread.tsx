import { useState, useEffect } from "hono/jsx";
import { PostsData } from "../types";
import dayjs from "dayjs";

const Thread = ({ id }: { id: string }) => {
    const [postData, setPostData] = useState<PostsData[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const postData = await fetch(`/api/threads/${id}`);
            const postJson: PostsData[] = await postData.json();
            console.log(postJson);
            setPostData(postJson);
        }
        fetchData();
    }, [id]); // idを依存配列に追加

    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const postData = { threadId: id, name, content, id };
        const response = await fetch('/api/new-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        if (response.ok) {
            console.log('Post added');
        } else {
            console.error('Failed to add post');
        }
    };
    return (
        <div class="flex flex-col bg-white p-4 m-4 rounded-lg shadow">
            <ul>
                {postData.map((post, index) => (
                    <li key={index} class="mb-4 last:mb-0">
                        <div class="flex items-center space-x-2 border-b border-l ml-1 pl-1 mr-1">
                            <span class="text-sm">
                                {index + 1}：
                            </span>
                            <span class="font-bold text-green-600">
                                {post.name ? post.name : "名無しさん"}
                            </span>
                            <span class="text-sm text-gray-500">
                                ID: {post.id}
                            </span>
                            <span class="text-sm text-gray-500">
                                {dayjs(post.createdAt).format("YYYY/MM/DD HH:mm:ss")}
                            </span>
                        </div>
                        <p class="mt-2">{post.content}</p>
                        <hr class="my-4" />
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} class="space-y-4">
                <label class="block">
                    <input type="text" placeholder="名前" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 border" />
                </label>
                <label class="block">
                    <textarea value={content} onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 border" />
                </label>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">作成</button>
            </form>
        </div>
    );
}

export default Thread;