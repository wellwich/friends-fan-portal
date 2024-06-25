import pages from '@hono/vite-cloudflare-pages'
import adapter from '@hono/vite-dev-server/cloudflare'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import ssg from '@hono/vite-ssg'
import client from 'honox/vite/client'

const entry = '/app/server.ts'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [
        client(),
      ],
    }
  } else {
    return {
      ssr: {
        external: ['react', 'react-dom', 'react-turnstile']
      },
      build: {
        emptyOutDir: false,
      },
      plugins: [
        honox({
          client: { input: ['/app/style.css'] },
          devServer: { adapter }
        }),
        pages(),
        //ssg({ entry }),
      ],
    }
  }
})