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
      <h4 className="text-xl font-medium">
        {org}/{repo}#{issue}
      </h4>
      <div className="text-2xl font-medium">${(total / 100).toFixed(2)}</div>
      <p className="text-gray-600">
        {contributors} contributor{contributors === 1 ? " has" : "s have"}{" "}
        contributed
      </p>
      <Chart donations={chartQuery.data?.contributions || ([] as any)} />
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const urlRef = useRef<HTMLInputElement>(null)

  const bountiesQuery = trpc.getFeaturedBounties.useQuery()

  return (
    <div className="container mx-auto p-6">
      <Head>
        <title>Fundbit</title>
      </Head>
      <Header />
      <main className="my-8">
        <div className="my-16">
          <h1 className="text-4xl font-medium text-center">
            Community-created bounties for repo-owners
          </h1>
          <h2 className="text-2xl text-center mt-4 text-gray-600">
            Fund open-source projects you use and get the issues you care about
            closed
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-medium">Open fundbits</h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bountiesQuery.data?.map((bounty) => (
              <Link
                href={`/bit/${bounty.org}/${bounty.repo}/${bounty.issue}`}
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
