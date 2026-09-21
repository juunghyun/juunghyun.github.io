import type { CollectionEntry } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { stripBase, stripLocale } from "./withBase";

export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

/** hreflang / sitemap 에 쓰는 언어 태그 */
export const LOCALE_TAGS: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ko" ? "en" : "ko";
}

type Post = CollectionEntry<"posts">;

/** 글의 언어. `src/content/posts/<locale>/...` 폴더가 결정한다. */
export function getPostLocale(post: Post): Locale {
  const first = post.id.split("/")[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** 언어 접두어를 뺀 글 키. 한·영 글은 같은 키를 공유한다. e.g. "hello-world" */
export function getPostKey(post: Post): string {
  const segments = post.id.split("/");
  return isLocale(segments[0]) ? segments.slice(1).join("/") : post.id;
}

export function filterByLocale(posts: Post[], locale: Locale): Post[] {
  return posts.filter(post => getPostLocale(post) === locale);
}

/** 같은 키를 가진 다른 언어 글 */
export function findTranslation(posts: Post[], post: Post): Post | undefined {
  const key = getPostKey(post);
  const target = otherLocale(getPostLocale(post));
  return posts.find(
    candidate =>
      getPostLocale(candidate) === target && getPostKey(candidate) === key
  );
}

/**
 * 현재 경로에 대응하는 언어별 URL.
 * 목록·태그·About 같은 미러 페이지는 경로만 바꾸고, 글 페이지는 override 로 번역 유무를 반영한다.
 */
export function getAlternates(
  pathname: string,
  locale: Locale,
  override?: Partial<Record<Locale, string | null>>
): Partial<Record<Locale, string>> {
  const relative = stripLocale(stripBase(pathname), locale).replace(/^\//, "");
  const result: Partial<Record<Locale, string>> = {};
  for (const candidate of LOCALES) {
    const overridden = override?.[candidate];
    if (overridden === null) continue;
    result[candidate] = overridden ?? getRelativeLocaleUrl(candidate, relative);
  }
  return result;
}
