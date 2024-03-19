import { httpBatchLink } from "@trpc/client"
import { createTRPCNext } from "@trpc/next"
import type { AppRouter } from "../server/routers/_app"
import SuperJSON from "superjson"

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return ""

  // TODO: use BASE_URL from .env
  // if (process.env.VERCEL_URL)
  //   return `https://${process.env.VERCEL_URL}`;

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: SuperJSON,
        }),
      ],
    }
  },
  transformer: SuperJSON,
  ssr: false,
})
