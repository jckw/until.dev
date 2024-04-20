import Link from "next/link"
import { Logo } from "./icons/Logo"
import { Input } from "@/ui/input"
import { useRouter } from "next/router"
import { parseGithubUrl } from "@/utils/parseGithubUrl"
import { CornerDownLeft, SquareSlash } from "lucide-react"
import { useEffect, useRef } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip"

export const Header = ({ activeIssueUrl }: { activeIssueUrl?: string }) => {
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
      <header className="relative flex items-center md:gap-6 container mx-auto md:h-[80px] min-h-[60px] flex-col md:flex-row gap-2 py-4 md:py-0">
        <div className="flex items-center gap-6">
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

        <nav className="flex items-center gap-6 text-gray-800">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>Available bounties</TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </header>
    </div>
  )
}
