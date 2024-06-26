import { createPagesRoute } from "@trigger.dev/nextjs";

import "@/jobs";

import { client } from "@/trigger";

//uncomment this to set a higher max duration (it must be inside your plan limits). Full docs: https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration
//export const config = {
//  maxDuration: 60,
//};

//this route is used to send and receive data with Trigger.dev
const { handler, config } = createPagesRoute(client);
export { config };

export default handler;
