import { inferRouterOutputs, initTRPC } from "@trpc/server"
import { AppRouter } from "./routers/_app"
import SuperJSON from "superjson"

const t = initTRPC.create({
  transformer: SuperJSON,
})

export const router = t.router
export const procedure = t.procedure

export type RouterOutput = inferRouterOutputs<AppRouter>
