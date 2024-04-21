import { createServerSideHelpers } from "@trpc/react-query/server"
import { GetServerSidePropsContext } from "next"
import SuperJSON from "superjson"

import { appRouter } from "@/server/routers/_app"

export const createHelpers = async (_ctx: GetServerSidePropsContext) => {
  // const trpcCtx = await createTRPCContext(ctx)

  return createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  })
}
