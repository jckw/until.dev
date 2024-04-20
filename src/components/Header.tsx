import Link from "next/link"
import { Logo } from "./icons/Logo"
import { Input } from "@/ui/input"
import { useRouter } from "next/router"
import { parseGithubUrl } from "@/utils/parseGithubUrl"
import { CornerDownLeft, SquareSlash } from "lucide-react"
import { useEffect, useRef } from "react"

export const Header = ({
  activeIssueUrl,
  hideSearchBar,
}: {
  activeIssueUrl?: string
  hideSearchBar?: boolean
}) => {
  const router = useRouter()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", (e) => {
        const activeElement = document.activeElement as HTMLElement | null
        if (activeElement && activeElement.tagName.toLowerCase() === "input") {
          return
        }

        if (e.key === "/") {
          ref.current?.focus()
          ref.current?.select()
          e.preventDefault()
        }
      })
    }
  }, [])

  return (
    <div className="border-b border-gray-100 w-full">
      <header className="relative flex items-center gap-6 container mx-auto h-[80px]">
        <Link
          href="/"
          className="flex items-center justify-center"
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
            ref={ref}
            LeftIcon={() => (
              <SquareSlash
                size={16}
                strokeWidth={1.5}
                className="stroke-gray-400"
              />
            )}
            RightIcon={() => (
              <CornerDownLeft
                size={16}
                strokeWidth={1.5}
                className="stroke-gray-400"
              />
            )}
            placeholder="Enter a Github Issue URL"
            spellCheck={false}
            type="url"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const { org, repo, id } = parseGithubUrl(e.currentTarget.value)
                if (org && repo && id) {
                  router.push(`/bounty/${org}/${repo}/${id}`)
                }
              }
            }}
            className="w-[200px] md:w-[400px]"
            defaultValue={activeIssueUrl || ""}
          />
        </div>
      </header>
    </div>
  )
}
