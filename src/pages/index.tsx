import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { useRef } from "react"
import { useRouter } from "next/router"

export default function Page() {
  const router = useRouter()
  const urlRef = useRef<HTMLInputElement>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = new URL(urlRef.current?.value || "")
    // parse URL using regex groups e.g. https://github.com/octokit/rest.js/issues/405
    const match = url.pathname.match(/\/([^/]+)\/([^/]+)\/issues\/(\d+)/)
    if (!match) {
      return
    }
    const [, org, repo, id] = match
    router.push(`/bit/${org}/${repo}/${id}`)
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <h1 className="text-4xl font-bold">Welcome to Fundbit!</h1>
      <form onSubmit={onSubmit}>
        <Input type="text" placeholder="Github Issue URL" ref={urlRef} />
        <Button type="submit">View bit</Button>
      </form>
    </main>
  )
}
