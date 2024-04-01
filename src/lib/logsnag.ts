import { LogSnag } from "@logsnag/node"

export const logsnag = new LogSnag({
  token: process.env.LOGSNAG_API_KEY!,
  project: "until",
})
