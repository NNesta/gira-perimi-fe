/* eslint-disable @next/next/no-img-element -- rendered to a PNG by next/og, not shown by the browser */
import { ImageResponse } from "next/og";

import { formatDayLong } from "@/lib/format";
import { BRAND_GRADIENT, FlagStripe, LOGO_MARK, OG_FONTS } from "@/lib/og";
import { fetchSharedResult } from "@/lib/shared-result";

const size = { width: 1200, height: 630 };

// The brand fonts have no ✓, so the tick is drawn.
const CHECK = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#0b1324" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
).toString("base64")}`;

function ring(score: number, total: number): string {
  const r = 120;
  const length = 2 * Math.PI * r;
  const filled = total ? (score / total) * length : 0;
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280">
      <circle cx="140" cy="140" r="${r}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="22"/>
      <circle cx="140" cy="140" r="${r}" fill="none" stroke="#fad201" stroke-width="22" stroke-linecap="round"
        stroke-dasharray="${filled.toFixed(1)} ${length.toFixed(1)}" transform="rotate(-90 140 140)"/>
    </svg>`,
  ).toString("base64")}`;
}

/**
 * "Nabonye 19/20": the card behind a shared result link, and the picture learners send on WhatsApp. A route of its own
 * (not opengraph-image) so its address stays /natsinze/<code>/ifoto: the share buttons and the download use it too.
 */
export async function GET(_request: Request, { params }: RouteContext<"/natsinze/[code]/ifoto">) {
  const { code } = await params;
  const result = await fetchSharedResult(code);
  const score = result?.score ?? 0;
  const total = result?.total ?? 20;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: BRAND_GRADIENT,
          fontFamily: "Jakarta",
          color: "#ffffff",
          padding: "70px 80px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: 560,
            background: "rgba(255,255,255,0.07)",
          }}
        />
        {result ? (
          <div style={{ display: "flex", alignItems: "center", gap: 64, width: "100%" }}>
            <div style={{ display: "flex", position: "relative", width: 280, height: 280, flexShrink: 0 }}>
              <img src={ring(score, total)} width={280} height={280} alt="" />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 280,
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 110, lineHeight: 1 }}>{score}</div>
                <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>kuri {total}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {result.passed && (
                <div
                  style={{
                    display: "flex",
                    alignSelf: "flex-start",
                    padding: "10px 22px",
                    borderRadius: 999,
                    alignItems: "center",
                    gap: 10,
                    background: "#fad201",
                    color: "#0b1324",
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  <img src={CHECK} width={24} height={24} alt="" />
                  Natsinze ikizamini cy’igerageza
                </div>
              )}
              <div style={{ display: "flex", marginTop: 26, fontFamily: "Bricolage", fontSize: 96, letterSpacing: -2, lineHeight: 1 }}>
                <span>Nabonye&nbsp;</span>
                <span style={{ color: "#ffd83d" }}>
                  {score}/{total}
                </span>
              </div>
              <div style={{ display: "flex", marginTop: 20, fontSize: 34, opacity: 0.94, lineHeight: 1.3 }}>
                mu kizamini cy’igerageza cy’amategeko y’umuhanda
              </div>
              <div style={{ display: "flex", marginTop: 12, fontSize: 26, opacity: 0.75 }}>
                {result.name} · {formatDayLong(result.day)}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 90, margin: "auto" }}>Tsinda Neza</div>
        )}

        <div style={{ position: "absolute", left: 80, right: 80, bottom: 44, display: "flex", alignItems: "center" }}>
          <img src={LOGO_MARK} width={54} height={54} alt="" style={{ borderRadius: 15 }} />
          <div style={{ display: "flex", marginLeft: 16, fontFamily: "Bricolage", fontSize: 38, letterSpacing: -1 }}>
            <span>Tsinda</span>
            <span style={{ color: "#ffd83d" }}>Neza</span>
          </div>
          <div style={{ display: "flex", marginLeft: "auto", fontSize: 26, fontWeight: 700, opacity: 0.9 }}>
            Nawe witoze ku buntu →
          </div>
        </div>
        <FlagStripe />
      </div>
    ),
    { ...size, fonts: OG_FONTS, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
