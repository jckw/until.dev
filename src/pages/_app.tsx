import { useEffect } from "react"
import { useIsomorphicLayoutEffect } from "react-use"
import Hotjar from "@hotjar/browser"
import type { AppProps } from "next/app"
import localFont from "next/font/local"
import Head from "next/head"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "sonner"

import "@/styles/globals.css"

import { Footer } from "@/components/Footer"
import { trpc } from "@/utils/trpc"

const GeistSans = localFont({
  src: "../assets/GeistVF.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
})

const siteId = 4952705
const hotjarVersion = 6

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    Hotjar.init(siteId, hotjarVersion)
  }, [])

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
          key="description"
          name="description"
          content="Until is a new way to fund open-source projects. Contribute to crowdfunded bounties on open-source issues, and set an expiry date for your donation."
        />
        <meta key="og:title" property="og:title" content="Until.dev" />
        <meta
          key="og:description"
          property="og:description"
          content="Until is a new way to fund open-source projects. Contribute to crowdfunded bounties on open-source issues, and set an expiry date for your donation."
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
          content={`${process.env.NEXT_PUBLIC_URL}/og.png`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Until bounties: Fund fast fixes in open-source, or your money back."
        />
        <meta
          name="twitter:description"
          content="Until is a new way to fund open-source projects. Contribute to crowdfunded bounties on open-source issues, and set an expiry date for your donation."
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_URL}/og.png`}
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
