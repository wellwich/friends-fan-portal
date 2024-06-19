import { createRoute } from 'honox/factory'
import KemonoFriends3 from '../islands/KemonoFriends3'
import Vtuber from '../islands/vtuber'

export default createRoute((c) => {
  const name = c.req.query('name') ?? 'Hono'
  return c.render(
    <div class="flex flex-col">
      <KemonoFriends3 />
      <Vtuber />
      <h2 class="text-3xl font-bold">けものフレンズＶぷろじぇくと</h2>
      <h2 class="text-3xl font-bold">グッズ情報</h2>
    </div>
    ,
    { title: name }
  )
})
