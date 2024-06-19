import { } from 'hono'

type Head = {
  title?: string
}

declare module 'hono' {
  interface Env {
    Variables: {
    }
    Bindings: {
      YOUTUBE_API_KEY: string
    }
  }
  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head): Response | Promise<Response>
  }
}
