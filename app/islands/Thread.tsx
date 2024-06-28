import { useState, useEffect, useRef } from "hono/jsx";
import { PostsData } from "../types";
import dayjs from "dayjs";
import { Turnstile } from "@wellwich/hono-turnstile"
import type { TurnstileInstance } from "@wellwich/hono-turnstile";

const Thread = ({ id, sitekey }: { id: string, sitekey: string }) => {
    const [postData, setPostData] = useState<PostsData[]>([]);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/api/threads/${id}`);
            const postJson: PostsData[] = await response.json();
            console.log(postJson);
            setPostData(postJson);
        }
        fetchData();
    }, [id]); // idを依存配列に追加

    const turnstileRef = useRef<TurnstileInstance>(null);


    const [content, setContent] = useState('');
    const [name, setName] = useState('');
    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const token = formData.get('cf-turnstile-response');

        const res = await fetch('/api/turnstile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await res.json() as { success: boolean };
        if (!data.success) {
            console.error('Failed to validate token');
            return;
        }

        const newPostData = { threadId: id, name, content }; // 変数名を変更
        if (!newPostData.content) {
            return;
        }
        const response = await fetch('/api/new-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPostData)
        });
        if (response.ok) {
            const postJson: PostsData = await response.json();
            console.log(postJson);
            console.log(postData);
            setPostData([...postData, postJson]);
            // フォームの入力フィールドをクリア
            setContent('');
            setName('');
        } else {
            console.error('Failed to add post');
        }
    };

    // 改行文字を<br />タグに変換する関数
    const renderContentWithBreaks = (content: string) => {
        return content.split('\n').map((line, index, array) => (
            <span key={index}>
                {line}
                {index < array.length - 1 && <br />}
            </span>
        ));
    };


    return (
        <div class="flex flex-col bg-white p-4 m-4 rounded-lg">
            <ul>
                {postData.map((post, index) => (
                    <li key={index} class="mb-4 last:mb-0">
                        <div class=" text-xs flex items-center space-x-2 border-b border-l-8 border-l-gray-600 ml-1 pl-1 mr-1">
                            <span class="">
                                {index + 1}:
                            </span>
                            <span class="font-bold text-green-600">
                                {post.name ? post.name : "名無しさん"}
                            </span>
                            <span class="text-gray-500">
                                ID: {post.id}
                            </span>
                            <span class="text-gray-500">
                                {dayjs(post.createdAt).format("YYYY/MM/DD HH:mm:ss")}
                            </span>
                        </div>
                        <p class="mt-2 mx-4">
                            {renderContentWithBreaks(post.content)}
                        </p>
                        <hr class="my-4" />
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} ref={formRef} class="border  rounded-md" action="/submit" method="POST">
                <label class="block">
                    <input type="text" placeholder="名無しさん" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} class="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 border-b m-2 outline-none" />
                </label>
                <label class="block">
                    <textarea value={content} onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)} class="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 m-2 outline-none h-32" />
                </label>
                <Turnstile siteKey={sitekey} />
                <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    書き込む
                </button>
            </form>
        </div>
    );
}

export default Thread;