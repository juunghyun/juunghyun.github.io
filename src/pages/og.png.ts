import type { APIRoute } from "astro";
import { renderSiteOg } from "@/utils/og";
import { useTranslations } from "@/i18n";

export const GET: APIRoute = ({ url }) =>
  renderSiteOg(url, useTranslations("ko").site.description);
