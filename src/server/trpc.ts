import { inferRouterOutputs, initTRPC } from "@trpc/server"
import SuperJSON from "superjson"

import { AppRouter } from "./routers/_app"

const t = initTRPC.create({
  transformer: SuperJSON,
})

export const router = t.router
export const procedure = t.procedure

export type RouterOutput = inferRouterOutputs<AppRouter>
