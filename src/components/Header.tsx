import Link from "next/link"
import { Logo } from "./icons/Logo"
import { Input } from "@/ui/input"

export const Header = ({ activeIssueUrl }: { activeIssueUrl?: string }) => {
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
          className="max-w-96 text-center"
          defaultValue={activeIssueUrl || ""}
        />
      </div>
    </header>
  )
}
