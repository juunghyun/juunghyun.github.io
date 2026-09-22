# 개인 테크 블로그 실행 계획

2026-09-21 · 이정현

PRD(docs/PRD.md)를 바탕으로 Phase 0과 Phase 1을 주 단위로 쪼갠 계획이다. 영어 번역은 Claude Code가 AI 티 없는 친근한 영어로 쓰고 필자가 승인한다(2026-09-22 변경). Claude Code는 구축·설정·코드 검증·발행 절차도 맡는다. 시작은 2026-09-22, Phase 1 완료 목표는 2026-10-19다.

## 0. 진행 상태 (2026-09-21 기준)

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| 0.1 스캐폴딩 | 완료 | AstroPaper v6.1.0(Astro 6.4) 을 레포에 병합, pnpm 설치 |
| 0.2 사이트 설정 | 완료 | 제목은 임시 `juunghyun`, 이름 결정 시 변경 |
| 0.3 GitHub 레포 | 완료 (2026-09-22) | 공개 레포 juunghyun/juunghyun.github.io, 로컬 폴더도 같은 이름 |
| 0.4 i18n 구조 | 완료 | ko `/`, en `/en/`, 같은 slug 로 번역 연결, hreflang·sitemap 대체 링크·언어별 RSS·OG 한글 폰트 |
| 0.5 배포 | 워크플로우만 완료 | `.github/workflows/deploy.yml`. 실제 배포는 0.3 이후 |
| 0.6 계정 | 완료 (2026-09-22) | giscus 앱 설치·Discussions(Announcements)·GoatCounter(juunghyun) 연결, id 는 `src/interactions.config.ts` |
| 0.7 상호작용 어댑터 | 완료 | Comments(giscus, 반응 포함)·ViewCount(글별 + 하단 전체 방문)·Analytics. 로컬 렌더로 위젯 로드 확인 |
| 1.3 시리즈·태그 | 완료 | frontmatter series/seriesOrder, SeriesNav, 언어별 태그 페이지 |
| 1.4 읽기 기준 | 완료 | Pretendard 웹폰트, 본문 폭 45rem, keep-all, 코드 폰트 분리. Lighthouse 는 배포 후 측정 |
| 1.5 OG 한글 | 완료 | Noto Sans KR 로 satori 렌더, 한글 제목 확인 |

로컬 검증: `pnpm run build` 17페이지, `pnpm lint`·`pnpm format:check` 통과, 한·영 글 페이지에 hreflang 3종과 언어 전환 링크 확인.

## 1. 역할

| 영역 | Claude Code | 필자 |
| --- | --- | --- |
| 사이트 구축 | AstroPaper 설치, i18n 구조, 상호작용 어댑터, 배포 워크플로우, 폰트·코드블록·OG | 결과 확인, 이름·도메인 결정 |
| 계정 | 설정값 안내, 설정 파일 반영 | giscus 앱 설치와 Discussions 켜기, GoatCounter 가입, 도메인 구매와 DNS |
| 글 | 소재 뼈대 제안, 재현 코드 작성·실행 검증, 영어 번역·윤문, 발행 체크리스트, PR·배포 | 한국어 초안, 한국어 윤문 확인, 영어 검수·승인 |
| 운영 | 지표 집계, 분기 회고 초안 | 리듬 유지, 결정 |

## 2. 일정

| 주 | 기간 | 목표 | 완료 조건 |
| --- | --- | --- | --- |
| 0 | 09-22 ~ 09-28 | Phase 0 개설 준비 | 빈 사이트가 juunghyun.github.io에서 열리고, 샘플 글이 한·영 두 주소에서 서로 링크되며, 댓글·조회수 위젯이 로드된다 |
| 1 | 09-29 ~ 10-05 | 이름·도메인 연결, About, 시리즈·태그, OG 한글 | 도메인에서 열림, About 두 언어, 시리즈 이전·다음 링크 |
| 2 | 10-06 ~ 10-12 | 글 1 발행, 글 2 한국어 초안, 읽기 기준 점검 | 글 1 한·영 공개, Lighthouse 90 이상 |
| 3 | 10-13 ~ 10-19 | 글 2·3 발행, 개설 점검 | 글 3편 두 언어, PRD 7절 Phase 1 완료 조건 전부 |

글 3편을 3주에 내는 것은 격주 1편 리듬보다 빠르다. 구축기(글 1)는 이 작업 기록으로 뼈대를 만들어 필자가 자기 문장으로 고치는 방식으로 시간을 줄인다. 부담되면 글 3을 11-02로 미루고 Phase 1을 2편으로 닫는다.

## 3. Phase 0 작업 (09-22 ~ 09-28)

| 순서 | 작업 | 담당 | 내용 | 완료 조건 |
| --- | --- | --- | --- | --- |
| 0.1 | 스캐폴딩 | Claude | 임시 폴더에 `npm create astro@latest -- --template satnaing/astro-paper` 실행 후 이 레포로 병합, pnpm install, dev 서버 확인 | `pnpm dev`로 샘플 사이트가 뜬다 |
| 0.2 | 사이트 설정 | Claude | astro-paper.config.ts에 site URL, author, lang ko, timezone Asia/Seoul. 샘플 글 삭제. README 병합 | `pnpm build` 통과 |
| 0.3 | GitHub 레포 | Claude, 실행 전 확인 | 로컬 폴더를 juunghyun.github.io로 바꾸고 공개 레포 생성·푸시 | github.com/juunghyun/juunghyun.github.io 존재 |
| 0.4 | i18n 구조 | Claude | astro.config i18n(ko 기본, en은 /en/, prefixDefaultLocale false). 글 컬렉션에 lang·slug. 페이지 라우트를 ko·en 두 벌로. src/i18n/lang/ko.ts 추가. 레이아웃에 hreflang과 언어 전환 링크. sitemap i18n. RSS 언어별 | 샘플 글이 /posts/hello/ 와 /en/posts/hello/ 에서 열리고 서로 링크, hreflang 출력 |
| 0.5 | 배포 | Claude | .github/workflows/deploy.yml(withastro/action@v6, actions/deploy-pages@v5), Pages 소스를 Actions로 | https://juunghyun.github.io 에서 열림 |
| 0.6 | 계정 | 필자 | giscus 앱 설치, Discussions 켜기, 카테고리 Comments(Announcements 형식) 생성 후 giscus.app에서 repo id·category id 복사. GoatCounter 가입(코드 juunghyun 권장), 설정에서 방문자 수 공개 켜기 | id 2개와 GoatCounter 코드 전달 |
| 0.7 | 상호작용 어댑터 | Claude | components/interactions/{Comments,Reactions,ViewCount}.astro와 providers.ts 한 파일에 설정. giscus mapping은 specific term = slug(한·영 공유, 9절 결정 대기). GoatCounter 스크립트는 레이아웃, 카운터는 counter JSON | 로컬에서 댓글 위젯과 조회수 숫자가 뜬다 |

## 4. Phase 1 작업 (09-29 ~ 10-19)

| 순서 | 작업 | 담당 | 내용 | 완료 조건 |
| --- | --- | --- | --- | --- |
| 1.1 | 이름·도메인 | 필자 결정, Claude 연결 | 후보 5개 제안, 선택, 구매, DNS(A 4개와 CNAME www), public/CNAME, HTTPS 강제 | 도메인에서 열리고 github.io는 리다이렉트 |
| 1.2 | About·프로젝트 | 필자 문장, Claude 페이지 | 소속·직군·경력·관심사, 프로젝트 목록, GitHub 프로필 상호 링크. 영어판은 필자 번역 | 두 언어 About |
| 1.3 | 시리즈·태그 | Claude | frontmatter series/seriesOrder, 시리즈 목록과 이전·다음 컴포넌트, 태그 페이지 언어별 | 시리즈 글에 이전·다음 |
| 1.4 | 읽기 기준 | Claude | Pretendard 서브셋 웹폰트, 본문 폭 680~720px, keep-all, 코드블록 파일명·줄 강조(Shiki transformers)·복사 버튼, 표 가로 스크롤 | PRD 6절 표 전부 |
| 1.5 | OG 이미지 한글 | Claude | AstroPaper OG 생성(Satori)에 한글 폰트 등록. 없으면 한글 제목이 깨진다 | 한글 제목 OG 정상 |
| 1.6 | 글 1: 블로그 구축기 | Claude 뼈대·번역, 필자 문장 | 이 작업 기록으로 뼈대를 만들고 필자가 고쳐 쓴다. 번역·윤문, 체크리스트, PR | 10-12 발행 |
| 1.7 | 글 2·3: 백엔드 함정 | 필자 초안, Claude 코드 검증 | 후보: JPA 영속성 컨텍스트 clear로 변경 유실, 보상 트랜잭션 전파 속성, 메트릭 화이트리스트 필터링. 회사 정보 없이 재현 코드로 | 10-19 발행 |
| 1.8 | 개설 점검 | Claude | Lighthouse, hreflang·sitemap·RSS 검증, 검색·댓글·조회수 실동작, 모바일 | PRD 7절 Phase 1 완료 조건 |

## 5. 글 한 편의 절차 (2주)

| 시점 | 필자 | Claude Code |
| --- | --- | --- |
| 1주 초 | 소재 확정, 한국어 초안 | 소재 뼈대(문제, 원인, 해결, 교훈), 재현 코드 작성·실행 |
| 1주 말 | 초안 완성 | 코드·수치 대조, AI 도움 문단 윤문 |
| 2주 초 | 영어판 읽고 승인 | 영어 번역·윤문(친근한 영어), 용어·숫자·링크 대조 |
| 2주 말 | 최종 확인 | 발행 체크리스트, PR, 배포, LinkedIn 요약문 초안 |

## 6. 필자가 정해야 하는 것과 기한

| 항목 | 기한 | 기본값(미정 시) |
| --- | --- | --- |
| 한·영 댓글 스레드 공유 여부 | 09-25 | 공유 |
| giscus·GoatCounter 계정 | 09-26 | 어댑터를 빈 상태로 두고 진행 |
| 첫 글 3편 소재 | 09-28 | 4절 1.6·1.7 후보 |
| 블로그 이름·도메인 | 10-05 | github.io로 개설, 도메인은 나중에 리다이렉트 |
| About 경력 문장 | 10-05 | 프로필 한 줄로 임시 |

## 7. 리스크와 대비

| 리스크 | 대비 |
| --- | --- |
| AstroPaper는 UI 문구만 i18n이라 콘텐츠 다국어는 직접 구성 | 0.4에서 별도 파일로 분리해 테마 업데이트 충돌 최소화 |
| OG 이미지 한글 깨짐 | 1.5에서 한글 폰트 등록, 실패 시 정적 OG 이미지로 대체 |
| 3주 3편 부담 | 글 3을 11-02로 미룰 수 있음 |
| 도메인 결정 지연 | github.io로 개설, 도메인은 리다이렉트로 이전 |
| Actions 배포 실패 | 로그 확인, withastro/action 대신 수동 빌드와 upload-pages-artifact |

## 8. Phase 2 이후 (요약)

Phase 2(2027-01-31까지): 구독 채널(Substack 등 외부 배포), 관련 글, 이미지 최적화, mermaid·KaTeX, 디자인시스템 적용 여부. Phase 3(2027-03 이후, 조건부): Kotlin/Spring 댓글·반응·조회수 API로 어댑터 교체.
