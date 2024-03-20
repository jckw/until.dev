import { toast } from "sonner"

export const parseGithubUrl = (githubUrl: string) => {
  let url
  try {
    url = new URL(githubUrl)
  } catch (error) {
    toast.error("Oops, that doesn't look like a valid URL", {
      position: "bottom-center",
    })
    return { match: false }
  }

  // parse URL using regex groups e.g. https://github.com/octokit/rest.js/issues/405
  const match = url.pathname.match(/\/([^/]+)\/([^/]+)\/issues\/(\d+)$/)
  if (!match) {
    toast.error("Oops, that doesn't look like a GitHub URL", {
      position: "bottom-center",
    })
    return { match: false }
  }
  const [, org, repo, id] = match
  return { org, repo, id, match: true }
}
