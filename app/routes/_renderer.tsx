import { Style } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'
import { Link } from 'honox/server'
import Footer from '../components/Footer'
import Header from '../islands/Header'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <Script src="/app/client.ts" async />
        <Link href='/app/style.css' rel='stylesheet' />
        <Style />
      </head>
      <Header />
      <main class="bg-yellow-400">
        <div class="max-w-5xl mx-auto ">
          <body class=" font-noto-sans">{children}</body>
        </div>
      </main>
      <Footer />
    </html>
  )
})
