import { useState } from "hono/jsx";

const menu = [
    { name: 'ニュース', path: '/news' },
    { name: 'グッズ', path: '/goods' },
    { name: 'イベント', path: '/event' },
    { name: 'コミュニティ', path: '/community' },
    { name: 'サイトについて', path: '/about' },
];

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-4 flex justify-between items-center">
                <div class="flex flex-col">
                    <a href="/" class="text-3xl font-bold min-w-min">ふれんずぽーたる</a>
                    <span>けもフレファンによる、けもフレファンのための非公式ファンサイト</span>
                </div>
                <button class="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    <span class="text-4xl">☰</span>
                </button>
            </div>
            <div class={`${isOpen ? 'block' : 'hidden'} md:block`}>
                <ul class="flex flex-col md:flex-row justify-between space-x-0 md:space-x-4">
                    {menu.map((item) => (
                        <li class="flex-1 min-w-0">
                            <a href={item.path} class="block p-2 text-center text-xs md:text-sm lg:text-base hover:bg-gray-200 truncate">
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
};
export default Header;