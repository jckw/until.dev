import { NextRequest } from "next/server"
import satori from "satori"

export const config = {
  runtime: "edge",
}

const WIDTH = 350

const Col = ({ height, index }: { height?: number; index: number }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,

      flex: 1,
      flexBasis: 0,
    }}
  >
    <div
      style={{
        height,
        backgroundColor: "#E3F5E9",
        borderTop: "3px solid #3AAD64",
      }}
    />
    <div
      style={{
        fontSize: 10,
        display: "flex",
        justifyContent: "center",
        fontFamily: "JetBrains Mono",
        color: "#A2AAB8",
      }}
    >
      {index}
    </div>
  </div>
)

const Badge = ({
  chart,
  currentTotal,
  changesIn,
}: {
  chart: number[]
  currentTotal: number
  changesIn: number
}) => {
  const max = Math.max(...chart) || 1

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #E5E7EB",
        borderRadius: 4,
        padding: 24,
        width: WIDTH,
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 3H18L22 9L12 22L2 9L6 3Z"
            stroke="#27AE60"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11 3L8 9L12 22L16 9L13 3"
            stroke="#27AE60"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M2 9H22"
            stroke="#27AE60"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div style={{ fontWeight: 500, fontSize: 16 }}>
          Current bounty reward
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 24,
            lineHeight: "32px",
            color: "#31323A",
            display: "flex",
          }}
        >
          ${(currentTotal / 100).toFixed(2)}
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: "18px",
            color: "#5D5F70",
            display: "flex",
          }}
        >
          changes in {changesIn} days
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "flex-end",
        }}
      >
        {chart.map((height, index) => (
          <Col height={(height / max) * 50} index={index} key={index} />
        ))}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#ffffff",
          height: 36,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          background: "linear-gradient(180deg, #223C44 0%, #0E1E23 100%)",
          border: "1px solid #000000",
          boxShadow:
            "inset 0px 1px 1px #53747E, inset 0px 1px 1px rgba(34, 60, 68, 0.4)",
          borderRadius: 8,
        }}
      >
        Fund this issue
      </div>
    </div>
  )
}

export default async function handler(req: NextRequest) {
  const { pathname } = new URL(req.url!)
  const matches = pathname.match(
    /^\/api\/(?<org>[^/]+)\/(?<repo>[^/]+)\/(?<issue>[^/]+)\/chart\.svg$/
  )

  const org = matches?.groups?.org!
  const repo = matches?.groups?.repo!
  const issue = matches?.groups?.issue!

  console.log({ org, repo, issue })

  const [geistMedium, geistRegular, mono] = await Promise.all([
    fetch(
      new URL("../../../../../assets/Geist-Medium.otf", import.meta.url)
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL("../../../../../assets/Geist-Regular.otf", import.meta.url)
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../../assets/JetBrainsMono-Regular.ttf",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer()),
  ])

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/${org}/${repo}/${issue}/chart.json`
  )
  const { data, currentTotal, changesIn } = (await res.json()) as {
    data: number[]
    currentTotal: number
    changesIn: number
  }

  const svg = await satori(
    <Badge chart={data} currentTotal={currentTotal} changesIn={changesIn} />,
    {
      width: WIDTH,
      fonts: [
        { name: "Geist", data: geistMedium, style: "normal", weight: 500 },
        { name: "Geist", data: geistRegular, style: "normal", weight: 400 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 400 },
      ],
    }
  )

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
    status: 200,
  })
}
