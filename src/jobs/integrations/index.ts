import { Resend } from "@trigger.dev/resend"

export const resend = new Resend({
  id: "resend",
  apiKey: process.env.RESEND_API_KEY!,
})
