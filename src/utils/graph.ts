import { getCollection, type CollectionEntry } from "astro:content";
import { getSortedPosts } from "./getSortedPosts";
import { getPostUrl } from "./getPostPaths";
import { filterByLocale, getPostKey, type Locale } from "./i18n";

/**
 * 글 지도(구 위젯) 데이터.
 * 노드 = 글, 좌표 = 구면 위 위·경도. 첫 태그가 같은 글끼리 한 군집으로 모이고,
 * 군집 중심은 피보나치 구면 분포로 고르게 퍼진다. 선은 시리즈 순서와 related 지정만 잇는다.
 */
export type GraphNode = {
  /** cobe 마커 id (CSS 식별자로 쓸 수 있게 정리한 slug) */
  id: string;
  key: string;
  title: string;
  url: string;
  tags: string[];
  series?: string;
  cluster: string;
  lat: number;
  lng: number;
  size: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  kind: "series" | "related";
};

export type GraphData = {
  locale: Locale;
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: { name: string; lat: number; lng: number; count: number }[];
};

type Post = CollectionEntry<"posts">;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export const toMarkerId = (key: string) =>
  key.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

/** i번째 점을 n개 점의 피보나치 구면 분포로. n=1 이면 적도 위 한 점. */
function fibonacciLatLng(i: number, n: number) {
  const y = n === 1 ? 0 : 1 - (2 * (i + 0.5)) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = i * GOLDEN_ANGLE;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  return { lat: toDeg(Math.asin(y)), lng: toDeg(Math.atan2(z, x)) };
}

/** 군집 중심에서 k번째 글의 위치: 반지름이 sqrt(k) 로 커지는 나선 */
function clusterOffset(
  center: { lat: number; lng: number },
  k: number,
  spread: number
) {
  if (k === 0) return center;
  const radius = Math.min(spread * Math.sqrt(k), 26);
  const angle = k * GOLDEN_ANGLE;
  const lat = Math.max(
    -80,
    Math.min(80, center.lat + radius * Math.cos(angle))
  );
  const lngScale = Math.max(Math.cos(toRad(center.lat)), 0.35);
  const lng = center.lng + (radius * Math.sin(angle)) / lngScale;
  return { lat, lng: ((lng + 540) % 360) - 180 };
}

export async function buildGraph(locale: Locale): Promise<GraphData> {
  const all = await getCollection("posts");
  const posts = getSortedPosts(filterByLocale(all, locale));

  const clusterOf = (post: Post) => post.data.tags[0] ?? "others";
  const clusterNames = [...new Set(posts.map(clusterOf))].sort(
    (a, b) =>
      posts.filter(p => clusterOf(p) === b).length -
      posts.filter(p => clusterOf(p) === a).length
  );
  const centers = new Map(
    clusterNames.map((name, i) => [
      name,
      fibonacciLatLng(i, clusterNames.length),
    ])
  );
  // 군집이 적을수록 넓게, 많을수록 촘촘하게
  const spread =
    clusterNames.length <= 2 ? 9 : clusterNames.length <= 6 ? 7 : 5;

  const keyToId = new Map(
    posts.map(p => [getPostKey(p), toMarkerId(getPostKey(p))])
  );
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (a: string, b: string, kind: GraphEdge["kind"]) => {
    if (a === b) return;
    const pair = [a, b].sort().join("|");
    if (seen.has(pair)) return;
    seen.add(pair);
    edges.push({ from: a, to: b, kind });
  };

  // 시리즈: seriesOrder 순으로 이웃끼리
  const bySeries = new Map<string, Post[]>();
  for (const post of posts) {
    if (!post.data.series) continue;
    bySeries.set(post.data.series, [
      ...(bySeries.get(post.data.series) ?? []),
      post,
    ]);
  }
  for (const group of bySeries.values()) {
    const ordered = [...group].sort(
      (a, b) =>
        (a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER)
    );
    for (let i = 1; i < ordered.length; i++) {
      addEdge(
        keyToId.get(getPostKey(ordered[i - 1]))!,
        keyToId.get(getPostKey(ordered[i]))!,
        "series"
      );
    }
  }
  // related: 같은 언어에 있는 slug 만
  for (const post of posts) {
    for (const target of post.data.related ?? []) {
      const targetId = keyToId.get(target);
      if (targetId)
        addEdge(keyToId.get(getPostKey(post))!, targetId, "related");
    }
  }

  const degree = new Map<string, number>();
  for (const { from, to } of edges) {
    degree.set(from, (degree.get(from) ?? 0) + 1);
    degree.set(to, (degree.get(to) ?? 0) + 1);
  }

  const counter = new Map<string, number>();
  const nodes: GraphNode[] = posts.map(post => {
    const cluster = clusterOf(post);
    const k = counter.get(cluster) ?? 0;
    counter.set(cluster, k + 1);
    const { lat, lng } = clusterOffset(centers.get(cluster)!, k, spread);
    const key = getPostKey(post);
    const id = keyToId.get(key)!;
    return {
      id,
      key,
      title: post.data.title,
      url: getPostUrl(post.id, post.filePath, locale),
      tags: post.data.tags,
      series: post.data.series,
      cluster,
      lat: Number(lat.toFixed(3)),
      lng: Number(lng.toFixed(3)),
      size: Number(
        (0.05 + 0.012 * Math.min(degree.get(id) ?? 0, 4)).toFixed(3)
      ),
    };
  });

  return {
    locale,
    nodes,
    edges,
    clusters: clusterNames.map(name => ({
      name,
      ...centers.get(name)!,
      count: counter.get(name) ?? 0,
    })),
  };
}
