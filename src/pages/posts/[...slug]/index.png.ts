import type { APIRoute } from "astro";
import type { CollectionEntry } from "astro:content";
import { getOgImagePaths } from "@/utils/routes";
import { renderPostOg } from "@/utils/og";

export const getStaticPaths = () => getOgImagePaths("ko");

export const GET: APIRoute = async ({ props, url }) => {
  const post = props as CollectionEntry<"posts">;
  return renderPostOg(url, post.data);
};
