import Link from "next/link"
import { Logo } from "./icons/Logo"
import { Input } from "@/ui/input"
import { useRouter } from "next/router"
import { parseGithubUrl } from "@/utils/parseGithubUrl"

export const Header = ({
  activeIssueUrl,
  hideSearchBar,
}: {
  activeIssueUrl?: string
  hideSearchBar?: boolean
}) => {
  const router = useRouter()

  return (
    <header className="relative flex flex-col gap-4 min-h-12">
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

      {hideSearchBar ? null : (
        <div className="flex items-center justify-center relative">
          <Input
            LeftIcon={() => (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V3.33333C14 2.59695 13.403 2 12.6667 2Z"
                  stroke="#A2AAB8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6 10L10 6"
                  stroke="#A2AAB8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
            RightIcon={() => (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.99935 6.66675L2.66602 10.0001L5.99935 13.3334"
                  stroke="#A2AAB8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M13.3327 2.66675V7.33341C13.3327 8.04066 13.0517 8.71894 12.5516 9.21903C12.0515 9.71913 11.3733 10.0001 10.666 10.0001H2.66602"
                  stroke="#A2AAB8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
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
            className="w-[200px] md:w-[400px] text-center"
            defaultValue={activeIssueUrl || ""}
          />
        </div>
      )}
    </header>
  )
}
