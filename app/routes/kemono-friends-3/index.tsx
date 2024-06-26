import { createRoute } from 'honox/factory'

export default createRoute((c) => {
    const name = c.req.query('name') ?? 'Hono'
    return c.render(
        <div class="flex flex-col">
            <h2 class="text-3xl font-bold"><a href="/kemono-friends-3/news">お知らせ検索</a></h2>
        </div>
        ,
        { title: name }
    )
})
