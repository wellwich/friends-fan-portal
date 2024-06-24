import { createRoute } from 'honox/factory'
import ThreadsList from '../../../islands/ThreadsList'

export default createRoute((c) => {
    const name = c.req.query('name') ?? 'Hono'

    return c.render(
        <div class="flex flex-col">
            <ThreadsList />
        </div>,
        { title: name }
    )
})