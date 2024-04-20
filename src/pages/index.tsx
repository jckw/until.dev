import { Input } from "@/ui/input"
import { useRouter } from "next/router"
import { parseGithubUrl } from "@/utils/parseGithubUrl"
import Head from "next/head"
import { Header } from "@/components/Header"
import { trpc } from "@/utils/trpc"
import Link from "next/link"
import { Chart } from "@/components/BountyChart"
import { createHelpers } from "@/utils/ssr"
import { GetServerSidePropsContext } from "next"
import { Card } from "@/components/Card"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Diamond, Gem } from "lucide-react"
import { HowItWorksSection } from "@/components/HowItWorksSection"

export default function Page() {
  const router = useRouter()

  const bountiesQuery = trpc.getFeaturedBounties.useQuery()

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Header />
      <main className="my-8 container mx-auto px-6">
        <div className="flex flex-col gap-3 my-16">
          <div className="flex flex-col-reverse lg:flex-row md:gap-16 lg:items-center">
            <div className="mt-8 mb-2 max-w-[600px]">
              <h1 className="text-[3rem] leading-[3rem] sm:text-[4rem] sm:leading-[4rem] font-medium font-display tracking-tight">
                Fund fast fixes in open-source,
                <br />
                or your money back.
              </h1>
              <h2 className="text-lg  mt-4 text-gray-700 mb-2">
                <span className="font-medium text-gray-900">
                  Until is a new way to fund open-source projects.
                </span>{" "}
                Contribute to crowdfunded bounties on open-source issues, and
                set an expiry date for your donation.
              </h2>
              <Input
                className="max-w-[350px]"
                variant="lg"
                placeholder="Jump to GitHub issue URL"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const { org, repo, id } = parseGithubUrl(
                      e.currentTarget.value
                    )
                    if (org && repo && id) {
                      router.push(`/bounty/${org}/${repo}/${id}`)
                    }
                  }
                }}
              />
            </div>
            <div className="flex-1 md:-mb-64 lg:mb-0">
              <svg
                width="100%"
                viewBox="0 0 784 369"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.3">
                  <path
                    d="M158.886 12.8345H9.62598V365.791H934.78V248.739H636.261V203.719H494.721V180.309H450.972V146.094H158.886V12.8345Z"
                    fill="#FEE4E1"
                  />
                  <path
                    d="M9.62598 12.8345H158.886V144.882H450.972V178.786H494.721V201.984H636.261V246.594H934.781V362.582H1137.48"
                    stroke="#FD766C"
                    stroke-width="9.62609"
                  />
                  <circle
                    cx="12.8348"
                    cy="12.8348"
                    r="12.8348"
                    fill="#FD766C"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <HowItWorksSection className="my-8" />

        <div className="flex flex-col gap-4">
          <div className="font-medium inline-block self-start">
            Recently funded
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bountiesQuery.data?.map((bounty) => (
              <Link
                href={`/bounty/${bounty.org}/${bounty.repo}/${bounty.issue}`}
                key={bounty.bountyIssueId}
              >
                <Card
                  icon={<Gem strokeWidth={1.5} className="stroke-green-600" />}
                  title={`${bounty.repo}`}
                  value={`$${(bounty.total / 100).toFixed(2)}`}
                  caption={`${bounty.org}/${bounty.repo}#${bounty.issue}`}
                />
              </Link>
            ))}
          </div>
        </div>
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
