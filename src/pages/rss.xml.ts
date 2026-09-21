import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import { filterByLocale } from "@/utils/i18n";
import { useTranslations } from "@/i18n";
import config from "@/config";

export async function GET() {
  const locale = "ko";
  const posts = filterByLocale(await getCollection("posts"), locale);
  const sortedPosts = getSortedPosts(posts);

  return rss({
    title: config.site.title,
    description: useTranslations(locale).site.description,
    site: config.site.url,
    items: sortedPosts.map(({ data, id, filePath }) => ({
      link: getPostUrl(id, filePath, locale),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
    customData: `<language>${locale}</language>`,
  });
}
