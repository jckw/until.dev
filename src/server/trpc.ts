import { inferRouterOutputs, initTRPC } from "@trpc/server"
import { AppRouter } from "./routers/_app"

const t = initTRPC.create()

export const router = t.router
export const procedure = t.procedure

export type RouterOutput = inferRouterOutputs<AppRouter>
