import { useState, useEffect } from 'hono/jsx';


const ThreadsAdd = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const threadData = { title };
        const response = await fetch('/api/new-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(threadData)
        });
        if (response.ok) {
            console.log('Thread added');
        } else {
            console.error('Failed to add thread');
        }
    };

    return (
        <div>
            <h1>スレッド作成</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    タイトル:
                    <input type="text" value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
                </label>
                <button type="submit">作成</button>
            </form>
        </div>
    );
};

export default ThreadsAdd;