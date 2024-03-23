import { Logo } from "@/components/icons/Logo"
import { ImageResponse } from "@vercel/og"
import { NextRequest } from "next/server"

export const config = {
  runtime: "edge",
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url!)

  // Make sure the font exists in the specified path:
  const [bricolage, inter] = await Promise.all([
    fetch(new URL("../../assets/Bricolage.ttf", import.meta.url)).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL("../../assets/Inter.otf", import.meta.url)).then((res) =>
      res.arrayBuffer()
    ),
  ])

  const repo = searchParams.get("repo")
  const issueNumber = searchParams.get("issue")

  const name = repo && issueNumber ? `${repo}#${issueNumber}` : ""

  return new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "100px 100px",
          textAlign: "left",
          justifyContent: "space-between",
          alignItems: "flex-start",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: '"Inter"',
              fontSize: 60,
              marginBottom: 20,
              color: "#4A5568",
            }}
          >
            Community-created bounty
          </div>
          <div
            style={{
              fontSize: 90,
              fontFamily: '"Bricolage Grotesque"',
            }}
          >
            {name}
          </div>
        </div>
        <Logo height={100} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Bricolage Grotesque",
          data: bricolage,
          style: "normal",
        },
        {
          name: "Inter",
          data: inter,
          style: "normal",
        },
      ],
    }
  )
}
