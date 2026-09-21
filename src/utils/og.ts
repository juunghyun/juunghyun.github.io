import { fontData, experimental_getFontFileURL } from "astro:assets";
import satori from "satori";
import sharp from "sharp";
import { getFontPathByWeight } from "./getFontPathByWeight";
import config from "@/config";

const FONT_VAR = "--font-noto-sans-kr";
const FONT_NAME = "Noto Sans KR";

async function loadFonts(url: URL) {
  const fonts = fontData[FONT_VAR];
  const regularPath = getFontPathByWeight(fonts, 400);
  const boldPath = getFontPathByWeight(fonts, 700);
  if (regularPath === undefined || boldPath === undefined) {
    throw new Error(`Cannot find the OG font path for ${FONT_NAME}.`);
  }
  const [regular, bold] = await Promise.all([
    fetch(experimental_getFontFileURL(regularPath, url)).then(r =>
      r.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(boldPath, url)).then(r =>
      r.arrayBuffer()
    ),
  ]);
  return [
    {
      name: FONT_NAME,
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: FONT_NAME,
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}

type OgInput = {
  title: string;
  subtitle: string;
  footerLeft: string;
  footerRight: string;
};

async function renderOg(input: OgInput, url: URL): Promise<Response> {
  const fonts = await loadFonts(url);
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#fdfdfd",
          color: "#282728",
          fontFamily: FONT_NAME,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 64,
                      fontWeight: 700,
                      lineHeight: 1.25,
                      maxHeight: "340px",
                      overflow: "hidden",
                    },
                    children: input.title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 28,
                      color: "#6b7280",
                      lineHeight: 1.4,
                      maxHeight: "80px",
                      overflow: "hidden",
                    },
                    children: input.subtitle,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 28,
                borderTop: "4px solid #006cac",
                paddingTop: "24px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontWeight: 700 },
                    children: input.footerLeft,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "#6b7280" },
                    children: input.footerRight,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, embedFont: true, fonts }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}

export function renderSiteOg(url: URL, description: string) {
  return renderOg(
    {
      title: config.site.title,
      subtitle: description,
      footerLeft: config.site.author,
      footerRight: new URL(config.site.url).hostname,
    },
    url
  );
}

export function renderPostOg(
  url: URL,
  post: { title: string; description: string; author: string }
) {
  return renderOg(
    {
      title: post.title,
      subtitle: post.description,
      footerLeft: post.author,
      footerRight: new URL(config.site.url).hostname,
    },
    url
  );
}
