import Image from "next/image"
import { Inter } from "next/font/google"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { trpc } from "@/utils/trpc"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  const hello = trpc.hello.useQuery({ text: "world" })

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <h1 className="text-4xl font-bold">Welcome to Fundbit!</h1>
      <p className="text-lg">{hello.data?.greeting}</p>
      <form>
        <Input type="text" placeholder="Github Issue URL" />
        <Button type="submit">View bit</Button>
      </form>
    </main>
  )
}
