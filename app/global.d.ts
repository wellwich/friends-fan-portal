import { } from 'hono'
import { KVNamespace } from '@cloudflare/workers-types/experimental'
import { D1Database } from '@cloudflare/workers-types/experimental'
import "@hono/react-renderer"

declare module '@hono/react-renderer' {
  interface Props {
    title?: string
  }
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

declare namespace turnstile {
  function render(selector: string, options: { callback: (token: string) => void }): void;
}

declare global {
  interface Window {
    _turnstileCb: () => void;
  }
}