import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { useRef } from "react"
import { useRouter } from "next/router"
import { parseGithubUrl } from "@/utils/parseGithubUrl"
import Head from "next/head"
import { Header } from "@/components/Header"
import { trpc } from "@/utils/trpc"
import Link from "next/link"
import { BountyChart, Chart } from "@/components/BountyChart"
import { createHelpers } from "@/utils/ssr"
import { GetServerSidePropsContext } from "next"

const BountyCard = ({
  org,
  repo,
  issue,
  total,
  contributors,
}: {
  org: string
  repo: string
  issue: number
  total: number
  contributors: number
}) => {
  const chartQuery = trpc.getBountyChart.useQuery({
    org,
    repo,
    issue,
  })

  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col gap-2">
      <div className="text-xl font-medium  text-gray-700">
        {org}/{repo}#{issue}
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="text-2xl font-bold font-display">
          ${(total / 100).toFixed(2)}
        </div>
        <p className="text-gray-600 text-sm">
          {contributors} contributor{contributors === 1 ? "" : "s"}
        </p>
      </div>
      <Chart
        donations={chartQuery.data?.contributions || ([] as any)}
        height={150}
      />
    </div>
  )
}

export default function Page() {
  const router = useRouter()

  const bountiesQuery = trpc.getFeaturedBounties.useQuery()

  return (
    <div className="container mx-auto p-6">
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Header hideSearchBar />
      <main className="my-8">
        <div className="flex flex-col gap-3 my-16">
          <div className="my-8">
            <h1 className="text-[3rem] leading-[3rem] sm:text-[4rem] sm:leading-[4rem] font-extrabold text-center font-display tracking-tight">
              Open-source Bounties created by the Community
            </h1>
            <h2 className="text-2xl text-center mt-4 text-gray-600">
              Fund open-source projects you use and prioritize the issues you
              care about
            </h2>
          </div>
          <div className="flex justify-center items-center">
            <Input
              className="max-w-[350px]"
              variant="lg"
              placeholder="Enter a GitHub issue URL"
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
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-full bg-gray-50 px-4 py-2 font-medium inline-block self-start">
            Recently funded
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bountiesQuery.data?.map((bounty) => (
              <Link
                href={`/bounty/${bounty.org}/${bounty.repo}/${bounty.issue}`}
                key={bounty.bountyIssueId}
              >
                <BountyCard
                  org={bounty.org}
                  repo={bounty.repo}
                  issue={bounty.issue}
                  total={bounty.total}
                  contributors={bounty.contributors}
                />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
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
