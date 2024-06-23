import { createRoute } from 'honox/factory'
import ThreadsList from '../../../islands/ThreadsList'
import ThreadsAdd from '../../../islands/ThreadsAdd'

export default createRoute((c) => {
    const name = c.req.query('name') ?? 'Hono'

    return c.render(
        <div class="flex flex-col">
            <ThreadsAdd />
            <ThreadsList />
        </div>,
        { title: name }
    )
})