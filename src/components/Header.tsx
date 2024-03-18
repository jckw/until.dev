import Link from "next/link"
import { Logo } from "./icons/Logo"
import { Input } from "@/ui/input"
import { useRouter } from "next/router"
import { parseGithubUrl } from "@/utils/parseGithubUrl"

export const Header = ({ activeIssueUrl }: { activeIssueUrl?: string }) => {
  const router = useRouter()

  return (
    <header className="relative flex flex-col gap-4">
      <Link
        href="/"
        className="flex items-center justify-center md:absolute z-50"
        style={{
          height: "100%",
          top: "0",
          bottom: "0",
          left: "0",
        }}
      >
        <Logo />
      </Link>

      <div className="flex items-center justify-center relative">
        <Input
          placeholder="Enter a Github Issue URL"
          spellCheck={false}
          type="url"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const { org, repo, id } = parseGithubUrl(e.currentTarget.value)
              if (org && repo && id) {
                router.push(`/bit/${org}/${repo}/${id}`)
              }
            }
          }}
          className="max-w-96 text-center"
          defaultValue={activeIssueUrl || ""}
        />
      </div>
    </header>
  )
}
