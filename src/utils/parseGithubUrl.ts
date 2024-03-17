export const parseGithubUrl = (githubUrl: string) => {
  const url = new URL(githubUrl)
  // parse URL using regex groups e.g. https://github.com/octokit/rest.js/issues/405
  const match = url.pathname.match(/\/([^/]+)\/([^/]+)\/issues\/(\d+)/)
  if (!match) {
    return { match: false }
  }
  const [, org, repo, id] = match
  return { org, repo, id, match: true }
}
