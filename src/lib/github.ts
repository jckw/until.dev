import { Octokit } from "@octokit/rest"
import { createAppAuth } from "@octokit/auth-app"

export const github = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: 857695,
    type: "app",
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    installationId: 48552298,
  },
})
