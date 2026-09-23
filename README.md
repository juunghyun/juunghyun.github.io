# juunghyun.github.io

이정현의 개인 테크 블로그. Astro + AstroPaper 위에 한국어(`/`)·영어(`/en/`) 두 언어를 얹은 정적 사이트다.
GitHub Pages 사용자 사이트(https://juunghyun.github.io)로 배포한다.

기획서: [docs/PRD.md](docs/PRD.md) · 실행 계획: [docs/PLAN.md](docs/PLAN.md) · 문구 검토표: [docs/UI-STRINGS.md](docs/UI-STRINGS.md)

## 실행

```sh
pnpm install
pnpm dev          # http://localhost:4321
pnpm run build    # astro check + build + pagefind 색인
pnpm preview
pnpm lint && pnpm format:check
```

Node 22.12 이상, pnpm 11.

## 구조

| 경로                                  | 내용                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `astro-paper.config.ts`               | 사이트 제목·URL·작성자·기능 토글                                                    |
| `src/interactions.config.ts`          | 댓글(giscus)·조회수(GoatCounter) 설정. id 를 비우면 해당 기능이 조용히 꺼진다       |
| `src/content/posts/{ko,en}/<slug>.md` | 글. 한·영은 같은 파일명(slug)을 쓴다                                                |
| `src/content/pages/{ko,en}/about.md`  | 소개 페이지                                                                         |
| `src/i18n/lang/{ko,en}.ts`            | UI 문구                                                                             |
| `src/utils/i18n.ts`                   | 언어 판정·번역 글 찾기·hreflang 대응 URL                                            |
| `src/utils/routes.ts`                 | 언어별 getStaticPaths 공용 헬퍼                                                     |
| `src/components/pages/*`              | 페이지 본체. `src/pages/*`(ko)와 `src/pages/en/*`는 이걸 감싸는 얇은 라우트         |
| `src/components/interactions/*`       | Comments · ViewCount · Analytics 어댑터                                             |
| `src/components/post/SeriesNav.astro` | 시리즈 목록·순서                                                                    |
| `src/components/GraphGlobe.astro`     | 글 지도 위젯(cobe). 데이터는 `src/utils/graph.ts` → `/graph.json`, `/en/graph.json` |
| `docs/PRD.md`, `docs/PLAN.md`         | 기획서와 실행 계획 (`docs/*.html` 은 읽기용 렌더)                                   |
| `tools/md2report.py`                  | docs 마크다운을 HTML 로 변환                                                        |

## 글 쓰기

```yaml
---
title: 제목
description: 한두 문장 요약 (검색 결과·OG 에 쓰인다)
pubDatetime: 2026-10-05T09:00:00+09:00
tags: [Kotlin, Spring]
series: jpa-pitfalls # 선택
seriesOrder: 1 # 선택
draft: false
---
```

- 같은 slug 로 `ko/`와 `en/`에 각각 두면 언어 전환 링크와 hreflang 이 자동으로 이어진다.
- 한쪽 언어만 있는 발행 글은 빌드가 실패해 배포되지 않는다. 영어판이 준비될 때까지는 `draft: true` 로 둔다.
- 발행 시각이 미래면 빌드에서 빠진다(예약 발행).
- OG 이미지는 글마다 자동 생성된다(Noto Sans KR).
- 글 지도(우측 하단 구)는 첫 태그로 군집을 만들고, 시리즈 순서와 `related` 만 선으로 잇는다. `#globe` 를 붙여 열면 펼친 상태로 시작한다.

## 배포

`main` 에 푸시하면 `.github/workflows/deploy.yml` 이 빌드해 GitHub Pages 에 올린다. 레포 설정에서 Pages 소스를 GitHub Actions 로 둔다.

## 다음 단계

`docs/PLAN.md` 참고. giscus·GoatCounter id 는 계정을 만든 뒤 `src/interactions.config.ts` 에 넣는다.

라이선스: 테마 AstroPaper(MIT, `LICENSE.astro-paper`). 글 저작권은 필자에게 있다.
