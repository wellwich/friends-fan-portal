import { } from 'hono'
import { KVNamespace } from '@cloudflare/workers-types/experimental'
import { D1Database } from '@cloudflare/workers-types/experimental'

type Head = {
  title?: string
}

declare module 'hono' {
  interface Env {
    Variables: {
    }
    Bindings: {
      TURNSTILE_SITE_KEY: string
      TURNSTILE_SECRET_KEY: string
      YOUTUBE_API_KEY: string
      KFV_API_CACHE: KVNamespace
      KF3_API_CACHE: KVNamespace
      DB: D1Database
    }
  }
  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head): Response | Promise<Response>
  }
}
