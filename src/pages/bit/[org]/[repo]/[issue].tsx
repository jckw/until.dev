import { useEffect } from "react"
import { useRouter } from "next/router"
import { loadStripe } from "@stripe/stripe-js"
import { trpc } from "@/utils/trpc"
import { toast } from "sonner"
import Head from "next/head"
import { Header } from "@/components/Header"
import { BountyDetails } from "@/components/BountyDetails"
import { BountyChart, Donation } from "@/components/BountyChart"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { ContributeForm } from "@/components/ContributeForm"
import { ContributionSuccessMessage } from "@/components/ContributionSuccessMessage"
import { IssueDetails } from "@/components/IssueDetails"

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
    <div className="container mx-auto p-6">
      <Head>
        <title>
          {issueQuery.data?.bountyExists
            ? "Community-created bounty for"
            : "Create bounty for"}{" "}
          {repo}#{issue} - Fundbit
        </title>
      </Head>

      <Header activeIssueUrl={issueQuery.data?.issue.html_url} />

      {issueQuery.data ? (
        <main
          className={`mt-8 md:py-8 grid ${
            issueQuery.data.bountyExists
              ? "md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-4"
              : "grid-cols-1 max-w-3xl md:mx-auto gap-12"
          }   auto-rows-max md:items-start`}
        >
          <IssueDetails
            className="md:col-start-1 md:row-start-1"
            issue={issueQuery.data.issue}
            org={org as string}
            repo={repo as string}
            issueNumber={Number(issue)}
            bountyExists={issueQuery.data.bountyExists}
          />

          {issueQuery.data.bountyExists ? (
            <>
              <BountyDetails
                className="md:col-start-2 md:row-start-1 md:self-end"
                totalInCents={chartQuery.data?.totalInCents!}
              />
              <BountyChart
                className="md:col-start-2 md:row-start-2 md:row-span-3"
                contributions={chartQuery.data?.contributions! as Donation[]}
              />
            </>
          ) : null}

          {success ? (
            <ContributionSuccessMessage
              className="row-start-2 md:col-start-1 md:row-start-2 md:my-4"
              bountyTotalStr={`$${chartQuery.data?.totalInCents!.toFixed(2)}`}
              bountyLevelExpiresAt={
                chartQuery.data?.contributions[0]?.expiresAt
              }
            />
          ) : null}

          <div className={`md:col-start-1 md:row-start-${success ? 3 : 2}`}>
            <ContributeForm
              org={org as string}
              repo={repo as string}
              issue={Number(issue)}
              bountyExists={issueQuery.data.bountyExists}
            />

            <HowItWorksSection
              org={org as string}
              repo={repo as string}
              issue={Number(issue)}
            />
          </div>
        </main>
      ) : null}
    </div>
  )
}
