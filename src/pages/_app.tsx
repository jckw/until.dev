import "@/styles/globals.css"
import { trpc } from "@/utils/trpc"
import type { AppProps } from "next/app"
import { Inter } from "next/font/google"
import { useIsomorphicLayoutEffect } from "react-use"

const interFont = Inter({ subsets: ["latin"] })

function App({ Component, pageProps }: AppProps) {
  useIsomorphicLayoutEffect(() => {
    document.body.className = `${interFont.className}`
  }, [])

  return <Component {...pageProps} />
}

export default trpc.withTRPC(App)
