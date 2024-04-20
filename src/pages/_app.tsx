import { Footer } from "@/components/Footer"
import "@/styles/globals.css"
import { trpc } from "@/utils/trpc"
import type { AppProps } from "next/app"
import { useIsomorphicLayoutEffect } from "react-use"
import { Toaster } from "sonner"
import NextTopLoader from "nextjs-toploader"
import Head from "next/head"
import Hotjar from "@hotjar/browser"

import localFont from "next/font/local"

const GeistSans = localFont({
  src: "../assets/GeistVF.woff2",
  variable: "--font-sans",
  weight: "100 900",
})

const siteId = 4952705
const hotjarVersion = 6

Hotjar.init(siteId, hotjarVersion)

function App({ Component, pageProps }: AppProps) {
  useIsomorphicLayoutEffect(() => {
    document.body.className = `${GeistSans.className} ${GeistSans.variable}`
  }, [])

  return (
    <>
      <Head>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta
          key="og:image"
          name="og:image"
          content={`${process.env.NEXT_PUBLIC_URL}/api/og`}
        />
        <meta
          key="description"
          name="description"
          content="Crowdfund reverse-bounties for open-source issues with Until.dev"
        />
        <meta key="og:title" property="og:title" content="Until.dev" />
        <meta
          key="og:description"
          property="og:description"
          content="Crowdfund reverse-bounties for open-source issues with Until.dev"
        />
        <meta
          key="og:url"
          property="og:url"
          content={process.env.NEXT_PUBLIC_URL}
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:image"
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
