import type { APIRoute } from "astro";
import { buildGraph } from "@/utils/graph";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildGraph("en")), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
