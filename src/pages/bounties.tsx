import { useState } from "react"
import { MailIcon } from "lucide-react"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import Link from "next/link"

import { Header } from "@/components/Header"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { createHelpers } from "@/utils/ssr"
import { trpc } from "@/utils/trpc"

export default function Page() {
  const [email, setEmail] = useState("")
  const registerMutation = trpc.registerBountyHunterInterest.useMutation()

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Header />
      <main className="my-8 container mx-auto px-6">
        <div className="flex flex-col gap-3 my-16">
          <div className="flex flex-col-reverse lg:flex-row md:gap-16 lg:items-center">
            <div className="mt-8 mb-2 max-w-[600px] text-center mx-auto">
              <h1 className="text-[3rem] leading-[3rem] sm:text-[4rem] sm:leading-[4rem] font-medium tracking-tight">
                Bigger bounties, everywhere, soon.
              </h1>
              <h2 className="text-lg  mt-4 text-gray-700 mb-4">
                <span className="font-medium text-gray-900">
                  Public bounties are still underdevelopment at Until.
                </span>{" "}
                Every bounty on Until is crowd-funded by the community, and
                bounties can be created anywhere and by anyone. That means a lot
                more bounties, and a lot more money for open-source bounty
                hunters.
              </h2>
              {registerMutation.isSuccess ? (
                <div className="text-green-700">
                  Thank you for your interest! Until&rsquo;s bounty platform is
                  still under development. We will be in touch soon with an
                  update.
                </div>
              ) : (
                <>
                  <div className="flex gap-2 sm:gap-4 mt-8 flex-col justify-stretch sm:justify-center sm:flex-row sm:items-center">
                    <Input
                      className="max-w-[350px]"
                      variant="lg"
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      LeftIcon={() => <MailIcon strokeWidth={1.5} />}
                    />
                    <Button
                      size="lg"
                      disabled={registerMutation.isPending}
                      onClick={() => registerMutation.mutate({ email })}
                    >
                      Get updates
                    </Button>
                  </div>

                  <div className="text-sm text-gray-700 mt-2">
                    By clicking &quot;Get updates&quot;, you agree to our{" "}
                    <Link href="/terms">Terms of Service</Link> and{" "}
                    <Link href="/privacy">Privacy Policy</Link>.
                  </div>

                  <div className="text-red-500">
                    {registerMutation.error?.message}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <HowItWorksSection className="my-8" />
      </main>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const helpers = await createHelpers(ctx)

  await Promise.all([helpers.getFeaturedBounties.fetch()])

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  }
}
