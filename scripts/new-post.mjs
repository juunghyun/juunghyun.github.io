#!/usr/bin/env node
/**
 * 한·영 글 파일 두 개를 한 번에 만든다.
 *   pnpm new-post <slug> ["한국어 제목"] ["English title"]
 * 둘 다 draft: true 로 생성된다. 영어판이 준비되면 두 파일의 draft 를 함께 지운다.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [slug, koTitle = "제목", enTitle = "Title"] = process.argv.slice(2);

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("사용법: pnpm new-post <slug> [한국어 제목] [English title]");
  console.error("slug 는 소문자·숫자·하이픈만: 예) jpa-clear-automatically-lost-update");
  process.exit(1);
}

// 사이트 타임존(Asia/Seoul) 기준 ISO 문자열, 예: 2026-10-05T09:00:00+09:00
const now = new Date();
const seoul = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const pubDatetime = seoul.toISOString().replace(/\.\d{3}Z$/, "+09:00");

const files = [
  { locale: "ko", title: koTitle, description: "한두 문장 요약. 검색 결과와 OG 에 쓰인다." },
  { locale: "en", title: enTitle, description: "One or two sentence summary, used in search results and OG." },
];

for (const { locale, title, description } of files) {
  const dir = join("src", "content", "posts", locale);
  const path = join(dir, `${slug}.md`);
  if (existsSync(path)) {
    console.error(`이미 있음: ${path}`);
    process.exit(1);
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path,
    `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
pubDatetime: ${pubDatetime}
tags: []
# series: 
# seriesOrder: 
draft: true
---

## 목차

## 
`,
    "utf8"
  );
  console.log(`생성: ${path}`);
}

console.log("\n두 파일을 채운 뒤 draft: true 를 지우면 발행된다. 한쪽만 지우면 빌드가 실패한다.");
