import type { GetStaticPathsOptions } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { getSortedPosts } from "./getSortedPosts";
import { getUniqueTags } from "./getUniqueTags";
import { getPostSlug } from "./getPostPaths";
import { slugifyAll } from "./slugify";
import { filterByLocale, findTranslation, type Locale } from "./i18n";
import config from "@/config";

type Post = CollectionEntry<"posts">;

export type AdjacentPost = {
  id: string;
  title: string;
  filePath: string | undefined;
} | null;

export type PostPageProps = {
  post: Post;
  prevPost: AdjacentPost;
  nextPost: AdjacentPost;
  /** 같은 키의 다른 언어 글 (없으면 undefined) */
  translation: Post | undefined;
  /** 같은 언어·같은 시리즈 글, seriesOrder 순 */
  seriesPosts: Post[];
};

const toAdjacent = (post: Post | undefined): AdjacentPost =>
  post
    ? { id: post.id, title: post.data.title, filePath: post.filePath }
    : null;

/** 글 목록 페이지네이션 경로 */
export async function getPostListPaths(
  locale: Locale,
  { paginate }: GetStaticPathsOptions
) {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return paginate(getSortedPosts(filterByLocale(posts, locale)), {
    pageSize: config.posts.perPage,
  });
}

/** 글 상세 경로 + 이전·다음·번역·시리즈 props */
export async function getPostPagePaths(locale: Locale) {
  const allPosts = await getCollection("posts");
  const sortedPosts = getSortedPosts(filterByLocale(allPosts, locale));

  return sortedPosts.map((post, index) => {
    const seriesPosts = post.data.series
      ? sortedPosts
          .filter(candidate => candidate.data.series === post.data.series)
          .sort(
            (a, b) =>
              (a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
              (b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER)
          )
      : [];

    const props: PostPageProps = {
      post,
      prevPost: toAdjacent(sortedPosts[index - 1]),
      nextPost: toAdjacent(sortedPosts[index + 1]),
      translation: findTranslation(allPosts, post),
      seriesPosts,
    };

    return { params: { slug: getPostSlug(post.id, post.filePath) }, props };
  });
}

/** 태그별 목록 페이지네이션 경로 */
export async function getTagPaths(
  locale: Locale,
  { paginate }: GetStaticPathsOptions
) {
  const posts = filterByLocale(
    await getCollection("posts", ({ data }) => !data.draft),
    locale
  );
  const tags = getUniqueTags(posts);

  return tags.flatMap(({ tag, tagName }) => {
    const tagPosts = getSortedPosts(
      posts.filter(({ data }) => slugifyAll(data.tags).includes(tag))
    );
    return paginate(tagPosts, {
      params: { tag },
      props: { tagName },
      pageSize: config.posts.perPage,
    });
  });
}

/** 동적 OG 이미지 경로 (ogImage 를 직접 지정하지 않은 글만) */
export async function getOgImagePaths(locale: Locale) {
  if (!config.features.dynamicOgImage) return [];
  const posts = filterByLocale(
    await getCollection("posts", ({ data }) => !data.draft && !data.ogImage),
    locale
  );
  return posts.map(post => ({
    params: { slug: getPostSlug(post.id, post.filePath) },
    props: post,
  }));
}
