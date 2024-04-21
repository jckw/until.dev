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
          fontSize: 14,
          color: "#ffffff",
          height: 36,
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignItems: "center",

          background: "linear-gradient(180deg, #223C44 0%, #0E1E23 100%)",
          border: "1px solid #000000",
          boxShadow:
            "inset 0px 1px 1px #53747E, inset 0px 1px 1px rgba(34, 60, 68, 0.4)",
          borderRadius: 8,
        }}
      >
        <div>Fund this issue with</div>
        <svg
          width="85"
          height="16"
          viewBox="0 0 85 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.318359"
            width="16"
            height="16"
            rx="2.90909"
            fill="#FD766C"
          />
          <path
            d="M1.77344 2.93823C1.77344 2.11884 2.43768 1.45459 3.25707 1.45459H6.86435C7.26601 1.45459 7.59162 1.7802 7.59162 2.18186V6.5455C7.59162 6.94716 7.26601 7.27277 6.86435 7.27277H2.50071C2.09905 7.27277 1.77344 6.94716 1.77344 6.5455V2.93823Z"
            fill="white"
          />
          <path
            d="M9.04492 9.45457C9.04492 9.05291 9.37053 8.72729 9.77219 8.72729H14.1358C14.5375 8.72729 14.8631 9.05291 14.8631 9.45457V13.0618C14.8631 13.8812 14.1989 14.5455 13.3795 14.5455H9.77219C9.37053 14.5455 9.04492 14.2199 9.04492 13.8182V9.45457Z"
            fill="white"
          />
          <path
            d="M1.77344 9.45457C1.77344 9.05291 2.09905 8.72729 2.50071 8.72729H6.86435C7.26601 8.72729 7.59162 9.05291 7.59162 9.45457V13.8182C7.59162 14.2199 7.26601 14.5455 6.86435 14.5455H3.25708C2.43769 14.5455 1.77344 13.8812 1.77344 13.0618V9.45457Z"
            fill="white"
          />
          <path
            d="M30.1134 13.0911H28.5774V12.1311C28.0189 12.8292 27.2334 13.2656 26.2211 13.2656C24.4582 13.2656 22.9222 11.9565 22.9222 9.75725V5.23652H24.4582V9.33834C24.4582 11.0314 25.2611 11.8692 26.5004 11.8692C27.7396 11.8692 28.5774 11.0314 28.5774 9.33834V5.23652H30.1134V13.0911ZM31.787 5.23652H33.323V6.19652C33.8816 5.49834 34.667 5.06197 35.6794 5.06197C37.4423 5.06197 38.9783 6.37106 38.9783 8.57034V13.0911H37.4423V8.98925C37.4423 7.29616 36.6394 6.45834 35.4001 6.45834C34.1609 6.45834 33.323 7.29616 33.323 8.98925V13.0911H31.787V5.23652ZM41.003 2.75797H42.539V5.23652H44.4416V6.59797H42.539V10.8045C42.539 11.3107 42.6787 11.7296 43.4467 11.7296H44.6161V13.0911H43.0278C41.5965 13.0911 41.003 12.3754 41.003 11.014V6.59797H40.0081V5.23652H41.003V2.75797ZM45.867 5.23652H47.403V13.0911H45.867V5.23652ZM45.5877 2.63579C45.5877 2.05979 46.0241 1.58852 46.635 1.58852C47.2634 1.58852 47.6997 2.05979 47.6997 2.63579C47.6997 3.22925 47.2634 3.70052 46.635 3.70052C46.0241 3.70052 45.5877 3.22925 45.5877 2.63579ZM48.774 11.6423C49.3674 11.5202 49.9784 11.014 50.5194 10.246C49.4024 8.18634 48.8438 5.5507 48.8438 3.99725C48.8438 2.23434 49.5769 0.698337 51.3398 0.698337C53.0853 0.698337 53.8358 2.23434 53.8358 3.99725C53.8358 5.5507 53.2773 8.18634 52.1602 10.246C52.7013 11.014 53.3296 11.5202 53.9231 11.6423V13.1783C52.9107 13.0387 52.0554 12.3929 51.3398 11.5027C50.6416 12.3929 49.7864 13.0387 48.774 13.1783V11.6423ZM50.3798 4.31143C50.3798 5.84743 50.7638 7.45325 51.3398 8.76234C51.9158 7.45325 52.2998 5.84743 52.2998 4.31143C52.2998 2.88016 51.9682 2.0947 51.3398 2.0947C50.7114 2.0947 50.3798 2.88016 50.3798 4.31143Z"
            fill="white"
          />
          <path
            d="M56.2527 13.2656C55.572 13.2656 55.1007 12.742 55.1007 12.1136C55.1007 11.4852 55.572 10.9616 56.2527 10.9616C56.9334 10.9616 57.4047 11.4852 57.4047 12.1136C57.4047 12.742 56.9334 13.2656 56.2527 13.2656ZM64.7577 0.872883H66.2937V13.0911H64.7577V12.0612C64.1992 12.8292 63.3614 13.2656 62.2792 13.2656C60.1672 13.2656 58.4566 11.6423 58.4566 9.16379C58.4566 6.66779 60.1672 5.06197 62.2792 5.06197C63.3614 5.06197 64.1992 5.49834 64.7577 6.24888V0.872883ZM60.0275 9.16379C60.0275 10.7172 60.9352 11.8692 62.4537 11.8692C63.9723 11.8692 64.8799 10.7172 64.8799 9.16379C64.8799 7.59288 63.9723 6.45834 62.4537 6.45834C60.9352 6.45834 60.0275 7.59288 60.0275 9.16379ZM75.288 10.5951C74.7818 12.2183 73.5251 13.2656 71.64 13.2656C69.1614 13.2656 67.6953 11.6423 67.6953 9.16379C67.6953 6.66779 69.0916 5.06197 71.5004 5.06197C73.7345 5.06197 75.3229 6.66779 75.3229 8.91943C75.3229 9.46052 75.2705 9.5827 75.2356 9.73979H69.3011C69.4931 10.9965 70.3134 11.8692 71.64 11.8692C72.6349 11.8692 73.2109 11.3282 73.6124 10.5951H75.288ZM69.3185 8.51797H73.6996C73.6996 7.69761 72.9491 6.45834 71.5004 6.45834C70.2436 6.45834 69.4931 7.29616 69.3185 8.51797ZM82.3088 5.23652H84.0193L80.6855 13.0911H79.0972L75.7808 5.23652H77.5088L79.9175 11.3107L82.3088 5.23652Z"
            fill="#A2AAB8"
          />
        </svg>
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
