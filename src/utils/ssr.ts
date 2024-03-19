import { appRouter } from "@/server/routers/_app"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { GetServerSidePropsContext } from "next"
import SuperJSON from "superjson"

export const createHelpers = async (ctx: GetServerSidePropsContext) => {
  // const trpcCtx = await createTRPCContext(ctx)

  return createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  })
}
