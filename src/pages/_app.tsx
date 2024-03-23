import { Footer } from "@/components/Footer"
import "@/styles/globals.css"
import { trpc } from "@/utils/trpc"
import type { AppProps } from "next/app"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import { useIsomorphicLayoutEffect } from "react-use"
import { Toaster } from "sonner"
import NextTopLoader from "nextjs-toploader"
import Head from "next/head"

const interFont = Inter({ subsets: ["latin"], variable: "--inter" })
const bricolageFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--bricolage",
  display: "swap",
  adjustFontFallback: false,
})

function App({ Component, pageProps }: AppProps) {
  useIsomorphicLayoutEffect(() => {
    document.body.className = `${interFont.className} ${interFont.variable} ${bricolageFont.variable}`
  }, [])

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta
          name="og:image"
          content={`${process.env.NEXT_PUBLIC_URL}/api/og`}
        />
        <meta
          name="description"
          content="Crowdfund reverse-bounties for open-source issues with Until.dev"
        />
        <meta property="og:title" content="Until.dev" />
        <meta
          property="og:description"
          content="Crowdfund reverse-bounties for open-source issues with Until.dev"
        />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_URL} />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_URL}/api/og`}
        />
        <script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        ></script>
      </Head>
      <NextTopLoader color="#FD766C" />
      <Component {...pageProps} />
      <Toaster position="top-right" />
      <Footer />
    </>
  )
}

export default trpc.withTRPC(App)
