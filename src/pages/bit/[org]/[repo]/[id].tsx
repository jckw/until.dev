import { useEffect, useState } from "react"
import octokit from "@/lib/github"
import { useRouter } from "next/router"
import { Input } from "@/ui/input"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/ui/button"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

export default function Page() {
  const router = useRouter()
  const { org, repo, id } = router.query

  const [resp, setResp] = useState<
    Awaited<ReturnType<typeof octokit.issues.get>>["data"] | null
  >(null)

  useEffect(() => {
    if (!org || !repo || !id) return

    octokit.issues
      .get({
        owner: org as string,
        repo: repo as string,
        issue_number: Number(id),
      })
      .then((response) => {
        setResp(response.data)
      })
  }, [org, repo, id])

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      {resp ? (
        <form action="/api/checkout" method="POST">
          <input type="hidden" name="org" value={org} />
          <input type="hidden" name="repo" value={repo} />
          <input type="hidden" name="id" value={id} />
          <h1 className="text-4xl font-bold">{resp.title}</h1>
          <p>Contribute to the bounty</p>
          <div className="flex gap-4 items-center">
            $
            <Input
              type="number"
              className="w-[180px]"
              placeholder="0"
              name="amount"
            />
            <div>Expires in</div>
            <select name="expiresIn">
              <option value="one_week">1 week</option>
              <option value="one_month">1 month</option>
              <option value="three_months">3 months</option>
              <option value="six_months">6 months</option>
              <option value="never">Never</option>
            </select>
          </div>
          <Button type="submit">Contribute</Button>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  )
}
