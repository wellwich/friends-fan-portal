import { createRoute } from 'honox/factory'
import Thread from '../../../islands/Thread';

export default createRoute((c) => {
    const name = c.req.query('name') ?? 'Hono'
    const { id } = c.req.param();

    return c.render(
        <div class="flex flex-col">
            <Thread id={id} />
        </div>,
        { title: name }
    )
})