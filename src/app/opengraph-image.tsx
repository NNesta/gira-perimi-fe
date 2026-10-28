import { ImageResponse } from "next/og";

import { BRAND_GRADIENT, FlagStripe, LOGO_MARK, OG_FONTS } from "@/lib/og";

export const alt = "Tsinda Neza · Iga amategeko y’umuhanda, utsinde ikizamini cya perimi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOPICS = ["Amasomo", "Ibyapa", "Imyitozo", "Ibizamini by’igerageza"];

/** The picture shown when a link to the site is shared (WhatsApp, Facebook, X...). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: BRAND_GRADIENT,
          fontFamily: "Jakarta",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -160,
            width: 560,
            height: 560,
            borderRadius: 560,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        <img
          src={LOGO_MARK}
          width={124}
          height={124}
          alt=""
          style={{ borderRadius: 34, boxShadow: "0 18px 40px rgba(2, 37, 27, 0.35)" }}
        />
        <div style={{ display: "flex", marginTop: 30, fontFamily: "Bricolage", fontSize: 96, letterSpacing: -3, lineHeight: 1 }}>
          <span>Tsinda</span>
          <span style={{ color: "#ffd83d" }}>Neza</span>
        </div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 36, opacity: 0.94 }}>
          Iga amategeko y’umuhanda, utsinde ikizamini cya perimi.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
          {TOPICS.map((topic) => (
            <div
              key={topic}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1.5px solid rgba(255,255,255,0.28)",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {topic}
            </div>
          ))}
        </div>

        <FlagStripe />
      </div>
    ),
    {
      ...size,
      fonts: OG_FONTS,
    },
  );
}
