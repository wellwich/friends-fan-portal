import { createRoute } from 'honox/factory'
import Thread from '../../../islands/Thread';

export default createRoute((c) => {
    const name = c.req.query('name') ?? 'Hono'
    const { id } = c.req.param();

    const sitekey = c.env.TURNSTILE_SITE_KEY
    const secretkey = c.env.TURNSTILE_SECRET_KEY

    return c.render(
        <div class="flex flex-col">
            <Thread id={id} sitekey={sitekey} secretkey={secretkey} />
        </div>,
        { title: name }
    )
})