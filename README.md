# tech-blog

개인 테크 블로그 프로젝트. 기획 문서와 도구를 모아 두고, Phase 0에서 Astro(AstroPaper) 사이트를 이 레포에 얹는다.
GitHub Pages 사용자 사이트로 배포할 때 레포 이름을 `juunghyun.github.io`로 바꾼다.

## 구성

| 경로 | 내용 |
| --- | --- |
| `docs/PRD.md` | PRD 마크다운. 정본은 Claude Doc이고 이 파일은 2026-09-21 내보내기본에 사례 분석을 반영한 사본 |
| `docs/PRD.html` | 읽기용 HTML. 개인 디자인시스템 report 템플릿으로 렌더 |
| `tools/md2report.py` | `docs/PRD.md`를 `docs/PRD.html`로 변환하는 스크립트 |

PRD 정본(Claude Doc): https://claude.ai/code/artifact/057aee8b-6630-48b6-bb7e-fcbaf0b02009

## HTML 다시 만들기

```sh
python3 tools/md2report.py docs/PRD.md ~/.claude/skills/design-system/templates/report.html docs/PRD.html
```

## 확정된 결정 요약 (2026-09-21)

- 구축: 하이브리드. 정적 사이트 + giscus(댓글·반응) + GoatCounter(조회수·분석), 상호작용은 어댑터 뒤에 두고 Phase 3에서 Kotlin/Spring 직접 서비스로 교체 가능
- 프레임워크 Astro, 테마 AstroPaper 기본 디자인
- 호스팅 GitHub Pages, 공개 레포, GitHub Actions 배포
- 한국어 `/` + 영어 `/en/` 병행 발행, 격주 1편
- Phase 1 필수: 글별 공개 조회수, Pagefind 검색, 시리즈·태그, About·프로젝트, 이름·도메인 결정

## 다음 단계 (Phase 0, 목표 2026-09-28)

블로그 이름·도메인 결정, AstroPaper 설치, i18n 구조 확인, Actions 배포, giscus·GoatCounter 계정.
