import { createRoute } from 'honox/factory'
import Community from '../../components/Community'

export default createRoute((c) => {
    const name = c.req.query('name') ?? 'Hono'
    return c.render(
        <div class="flex flex-col">
            <Community />
        </div>,
        { title: name }
    )
})