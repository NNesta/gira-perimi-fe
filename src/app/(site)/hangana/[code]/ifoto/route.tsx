/* eslint-disable @next/next/no-img-element -- rendered to a PNG by next/og, not shown by the browser */
import { ImageResponse } from "next/og";

import { fetchPublicChallenge } from "@/lib/challenge";
import { BRAND_GRADIENT, FlagStripe, LOGO_MARK, OG_FONTS } from "@/lib/og";

const size = { width: 1200, height: 630 };

/** The picture a "Hangana nanjye" link shows on WhatsApp: who challenges you, and the score to beat. */
export async function GET(_request: Request, { params }: RouteContext<"/hangana/[code]/ifoto">) {
  const { code } = await params;
  const challenge = await fetchPublicChallenge(code);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          background: BRAND_GRADIENT,
          fontFamily: "Jakarta",
          color: "#ffffff",
          padding: "60px 80px 110px",
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
        {challenge ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 22px",
                borderRadius: 999,
                background: "#fad201",
                color: "#0b1324",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              Hangana nanjye
            </div>
            <div style={{ display: "flex", marginTop: 28, fontFamily: "Bricolage", fontSize: 76, lineHeight: 1.05 }}>
              {challenge.creator_name} yabonye&nbsp;
              <span style={{ color: "#ffd83d" }}>
                {challenge.creator_score}/{challenge.total}
              </span>
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 38, opacity: 0.94 }}>
              Ese wowe wamutsinda kuri ibi bibazo {challenge.total}?
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
            Ibibazo 20 · iminota 20 · ku buntu →
          </div>
        </div>
        <FlagStripe />
      </div>
    ),
    { ...size, fonts: OG_FONTS, headers: { "Cache-Control": "public, max-age=600" } },
  );
}
