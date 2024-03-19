import { Footer } from "@/components/Footer"
import "@/styles/globals.css"
import { trpc } from "@/utils/trpc"
import type { AppProps } from "next/app"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import { useIsomorphicLayoutEffect } from "react-use"
import { Toaster } from "sonner"
import NextTopLoader from "nextjs-toploader"

const interFont = Inter({ subsets: ["latin"], variable: "--inter" })
const bricolageFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--bricolage",
})

function App({ Component, pageProps }: AppProps) {
  useIsomorphicLayoutEffect(() => {
    document.body.className = `${interFont.className} ${interFont.variable} ${bricolageFont.variable}`
  }, [])

  return (
    <>
      <NextTopLoader color="#FD766C" />
      <Component {...pageProps} />
      <Toaster position="top-right" />
      <Footer />
    </>
  )
}

export default trpc.withTRPC(App)
