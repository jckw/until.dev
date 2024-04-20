import { useEffect } from "react"
import { useRouter } from "next/router"
import { loadStripe } from "@stripe/stripe-js"
import { trpc } from "@/utils/trpc"
import { toast } from "sonner"
import Head from "next/head"
import { Header } from "@/components/Header"
import { Chart, Donation } from "@/components/BountyChart"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { ContributeForm } from "@/components/ContributeForm"
import { ContributionSuccessMessage } from "@/components/ContributionSuccessMessage"
import { IssueDetails } from "@/components/IssueDetails"
import { GetServerSidePropsContext } from "next"
import { createHelpers } from "@/utils/ssr"
import { BadgePercent, Gem, Users } from "lucide-react"
import { cn } from "@/utils"
import { format } from "date-fns"
import { Card } from "@/components/Card"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

export default function Page() {
  const router = useRouter()
  const { org, repo, issue } = router.query
  const success = router.query["success"] === "true"

  useEffect(() => {
    if (success) {
      toast.success("Your donation was successful!")
    }
  }, [success])

  // TODO: Clear query params
  const issueQuery = trpc.getIssueMeta.useQuery(
    {
      org: org as string,
      repo: repo as string,
      issue: Number(issue),
    },
    {
      enabled: Boolean(org && repo && issue),
    }
  )
  const chartQuery = trpc.getBountyChart.useQuery(
    {
      org: org as string,
      repo: repo as string,
      issue: Number(issue),
    },
    {
      enabled: Boolean(org && repo && issue),
    }
  )

  return (
    <>
      <Head>
        <title>
          {issueQuery.data?.bounty
            ? "Community-created bounty for"
            : "Create bounty for"}{" "}
          {repo}#{issue} - {process.env.NEXT_PUBLIC_APP_NAME}
        </title>
        <meta
          key="og:image"
          name="og:image"
          content={`${process.env.NEXT_PUBLIC_URL}/api/og?repo=${repo}&issue=${issue}`}
        />
      </Head>

      <Header activeIssueUrl={issueQuery.data?.issue?.html_url || ""} />

      {issueQuery.data ? (
        <main className="flex flex-col gap-6 mt-6 container mx-auto px-6">
          <IssueDetails
            org={org as string}
            repo={repo as string}
            meta={issueQuery.data}
          />

          {success ? (
            <ContributionSuccessMessage
              bountyTotalStr={`$${(
                chartQuery.data?.amount.total! / 100
              ).toFixed(2)}`}
              bountyLevelExpiresAt={
                chartQuery.data?.contributions[0]?.expiresAt
              }
              org={org as string}
              repo={repo as string}
              issue={issue as string}
            />
          ) : null}

          <div className="flex gap-4 flex-col lg:flex-row">
            <ContributeForm
              org={org as string}
              repo={repo as string}
              issue={Number(issue)}
              bountyExists={!!issueQuery.data?.bounty}
              meta={issueQuery.data}
              className="lg:w-2/5"
            />
            <div className="flex-1 flex gap-4 flex-col md:flex-row">
              <Card
                className="flex-1"
                icon={<Gem strokeWidth={1.5} className="stroke-green-600" />}
                title="Current bounty reward"
                value={`$${(chartQuery.data?.amount.total! / 100).toFixed(2)}`}
                tooltip={`~$${(
                  chartQuery.data?.amount.availableTotal! / 100
                ).toFixed(2)} after fees`}
                caption={`if solved before ${
                  chartQuery.data?.contributions[0]?.expiresAt
                    ? format(
                        new Date(chartQuery.data.contributions[0].expiresAt),
                        "MMMM d yyyy"
                      )
                    : "the end of time"
                }`}
              >
                <Chart
                  donations={chartQuery.data?.contributions! as Donation[]}
                  height={150}
                />
              </Card>
              <div className="flex gap-4 flex-col sm:flex-row md:flex-col md:max-w-64">
                <Card
                  icon={
                    <Users strokeWidth={1.5} className="stroke-green-600" />
                  }
                  title="Total contributors"
                  value={chartQuery.data?.contributions.length || 0}
                  caption={
                    chartQuery.data?.contributions.length === 1
                      ? "contributor"
                      : "contributors"
                  }
                />
                <Card
                  className="flex-1"
                  icon={
                    <BadgePercent
                      strokeWidth={1.5}
                      className="stroke-green-600"
                    />
                  }
                  title="Bounty recipient split"
                  tooltip="Public bounties are coming soon"
                  // TODO: Implement splits
                  // value="80:20"
                  // caption="PR author gets 80% of the reward, maintainer gets 20%"
                  value="0:100"
                  caption="This is a maintainer bounty, with 100% of the reward going to the maintainer"
                />
              </div>
            </div>
          </div>

          <HowItWorksSection />
        </main>
      ) : null}
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const helpers = await createHelpers(ctx)

  const [issueMeta] = await Promise.all([
    helpers.getIssueMeta.fetch({
      org: ctx.params!.org as string,
      repo: ctx.params!.repo as string,
      issue: Number(ctx.params!.issue),
    }),
    helpers.getBountyChart.fetch({
      org: ctx.params!.org as string,
      repo: ctx.params!.repo as string,
      issue: Number(ctx.params!.issue),
    }),
  ])

  if (issueMeta.issue === null) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  }
}
