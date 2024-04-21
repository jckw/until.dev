import * as Sentry from "@sentry/nextjs"
import { NextRequest } from "next/server"
import satori from "satori"

export const config = {
  runtime: "edge",
}

const WIDTH = 450
const BAR_HEIGHT = 75

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
  changesIn: number | null
}) => {
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
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 16,
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <svg
          width="106"
          height="20"
          viewBox="0 0 106 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="20" height="20" rx="3.63636" fill="#FD766C" />
          <path
            d="M1.81836 3.67242C1.81836 2.64818 2.64867 1.81787 3.67291 1.81787H8.182C8.68407 1.81787 9.09109 2.22489 9.09109 2.72696V8.18151C9.09109 8.68358 8.68407 9.0906 8.182 9.0906H2.72745C2.22537 9.0906 1.81836 8.68358 1.81836 8.18151V3.67242Z"
            fill="white"
          />
          <path
            d="M10.9102 11.8183C10.9102 11.3162 11.3172 10.9092 11.8192 10.9092H17.2738C17.7759 10.9092 18.1829 11.3162 18.1829 11.8183V16.3274C18.1829 17.3516 17.3526 18.1819 16.3283 18.1819H11.8192C11.3172 18.1819 10.9102 17.7749 10.9102 17.2728V11.8183Z"
            fill="white"
          />
          <path
            d="M1.81836 11.8183C1.81836 11.3162 2.22537 10.9092 2.72745 10.9092H8.182C8.68407 10.9092 9.09109 11.3162 9.09109 11.8183V17.2728C9.09109 17.7749 8.68407 18.1819 8.182 18.1819H3.67291C2.64867 18.1819 1.81836 17.3516 1.81836 16.3274V11.8183Z"
            fill="white"
          />
          <path
            d="M37.2443 16.3638H35.3243V15.1638C34.6262 16.0365 33.6443 16.582 32.3789 16.582C30.1753 16.582 28.2553 14.9456 28.2553 12.1965V6.54559H30.1753V11.6729C30.1753 13.7892 31.1789 14.8365 32.728 14.8365C34.2771 14.8365 35.3243 13.7892 35.3243 11.6729V6.54559H37.2443V16.3638ZM39.3363 6.54559H41.2563V7.74559C41.9545 6.87286 42.9363 6.32741 44.2018 6.32741C46.4054 6.32741 48.3254 7.96377 48.3254 10.7129V16.3638H46.4054V11.2365C46.4054 9.12013 45.4018 8.07286 43.8527 8.07286C42.3036 8.07286 41.2563 9.12013 41.2563 11.2365V16.3638H39.3363V6.54559ZM50.8563 3.44741H52.7763V6.54559H55.1545V8.24741H52.7763V13.5056C52.7763 14.1383 52.9509 14.662 53.9109 14.662H55.3727V16.3638H53.3872C51.5982 16.3638 50.8563 15.4692 50.8563 13.7674V8.24741H49.6127V6.54559H50.8563V3.44741ZM56.9363 6.54559H58.8563V16.3638H56.9363V6.54559ZM56.5872 3.29468C56.5872 2.57468 57.1326 1.98559 57.8963 1.98559C58.6817 1.98559 59.2272 2.57468 59.2272 3.29468C59.2272 4.0365 58.6817 4.62559 57.8963 4.62559C57.1326 4.62559 56.5872 4.0365 56.5872 3.29468ZM60.57 14.5529C61.3118 14.4001 62.0755 13.7674 62.7518 12.8074C61.3555 10.2329 60.6573 6.93831 60.6573 4.9965C60.6573 2.79286 61.5737 0.872859 63.7773 0.872859C65.9591 0.872859 66.8973 2.79286 66.8973 4.9965C66.8973 6.93831 66.1991 10.2329 64.8028 12.8074C65.4791 13.7674 66.2646 14.4001 67.0064 14.5529V16.4729C65.7409 16.2983 64.6718 15.491 63.7773 14.3783C62.9046 15.491 61.8355 16.2983 60.57 16.4729V14.5529ZM62.5773 5.38922C62.5773 7.30922 63.0573 9.3165 63.7773 10.9529C64.4973 9.3165 64.9773 7.30922 64.9773 5.38922C64.9773 3.60013 64.5628 2.61831 63.7773 2.61831C62.9918 2.61831 62.5773 3.60013 62.5773 5.38922Z"
            fill="black"
          />
          <path
            d="M69.9184 16.582C69.0675 16.582 68.4784 15.9274 68.4784 15.142C68.4784 14.3565 69.0675 13.702 69.9184 13.702C70.7693 13.702 71.3584 14.3565 71.3584 15.142C71.3584 15.9274 70.7693 16.582 69.9184 16.582ZM80.5497 1.09104H82.4697V16.3638H80.5497V15.0765C79.8515 16.0365 78.8042 16.582 77.4515 16.582C74.8115 16.582 72.6733 14.5529 72.6733 11.4547C72.6733 8.33468 74.8115 6.32741 77.4515 6.32741C78.8042 6.32741 79.8515 6.87286 80.5497 7.81104V1.09104ZM74.637 11.4547C74.637 13.3965 75.7715 14.8365 77.6697 14.8365C79.5679 14.8365 80.7024 13.3965 80.7024 11.4547C80.7024 9.49104 79.5679 8.07286 77.6697 8.07286C75.7715 8.07286 74.637 9.49104 74.637 11.4547ZM93.7125 13.2438C93.0798 15.2729 91.5089 16.582 89.1525 16.582C86.0543 16.582 84.2216 14.5529 84.2216 11.4547C84.2216 8.33468 85.9671 6.32741 88.978 6.32741C91.7707 6.32741 93.7562 8.33468 93.7562 11.1492C93.7562 11.8256 93.6907 11.9783 93.6471 12.1747H86.2289C86.4689 13.7456 87.4943 14.8365 89.1525 14.8365C90.3962 14.8365 91.1162 14.1601 91.618 13.2438H93.7125ZM86.2507 10.6474H91.7271C91.7271 9.62195 90.7889 8.07286 88.978 8.07286C87.4071 8.07286 86.4689 9.12013 86.2507 10.6474ZM102.489 6.54559H104.627L100.459 16.3638H98.474L94.3286 6.54559H96.4886L99.4995 14.1383L102.489 6.54559Z"
            fill="#686868"
          />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: BAR_HEIGHT / 2,
          }}
        >
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
            {changesIn === null
              ? "minimum bounty"
              : `changes in ${changesIn} days`}
          </div>
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
          <Col
            height={(height / (currentTotal || 1)) * BAR_HEIGHT}
            index={index}
            key={index}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 14,
            gap: 1,
          }}
        >
          <div style={{ color: "#7A8096" }}>Bounty value by days from now</div>
          <div style={{ color: "#4D4F5B" }}>100% maintainer reward</div>
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
            padding: "0 14px",

            background: "linear-gradient(180deg, #223C44 0%, #0E1E23 100%)",
            border: "1px solid #000000",
            boxShadow:
              "inset 0px 1px 1px #53747E, inset 0px 1px 1px rgba(34, 60, 68, 0.4)",
            borderRadius: 8,
          }}
        >
          Contribute
        </div>
      </div>
    </div>
  )
}

export default async function handler(req: NextRequest) {
  const { pathname } = new URL(req.url!)
  const matches = pathname.match(
    /^\/api\/github\/(?<org>[^/]+)\/(?<repo>[^/]+)\/(?<issue>[^/]+)\/chart\.svg$/
  )

  const org = matches?.groups?.org!
  const repo = matches?.groups?.repo!
  const issue = matches?.groups?.issue!

  try {
    const [geistMedium, geistRegular, mono] = await Promise.all([
      fetch(
        new URL("../../../../../../assets/Geist-Medium.otf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
      fetch(
        new URL("../../../../../../assets/Geist-Regular.otf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
      fetch(
        new URL(
          "../../../../../../assets/JetBrainsMono-Regular.ttf",
          import.meta.url
        )
      ).then((res) => res.arrayBuffer()),
    ])

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/github/${org}/${repo}/${issue}/chart.json`
    )
    const { data, currentTotal, changesIn } = (await res.json()) as {
      data: number[]
      currentTotal: number
      changesIn: number | null
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
  } catch (e) {
    console.error(e)
    Sentry.captureException(e)

    return new Response(
      '<svg width="1" height="1" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"></svg>',
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
        status: 400,
      }
    )
  }
}
