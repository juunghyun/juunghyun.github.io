# UI 문구 검토표

2026-09-22 · 이정현

메뉴·버튼·안내 문구 65개다. 파일은 `src/i18n/lang/ko.ts`, `src/i18n/lang/en.ts`이고 키 하나가 두 파일에 같은 이름으로 있다. `{...}` 는 실행 때 값이 들어가는 자리라 남겨야 한다.

| 키 | 쓰이는 곳 | 한국어 | 영어 |
| --- | --- | --- | --- |
| `site.description` | 메타 설명·RSS·OG | 개발자 이정현을 기록 | A record of Junghyun Lee, developer. |
| `lang.name` | 언어 전환 링크 | 한국어 | English |
| `lang.switchTo` | 언어 전환 링크 | English | 한국어 |
| `nav.home` | 상단 메뉴·브레드크럼 | 홈 | Home |
| `nav.posts` | 상단 메뉴·브레드크럼 | 글 | Posts |
| `nav.tags` | 상단 메뉴·브레드크럼 | 태그 | Tags |
| `nav.about` | 상단 메뉴·브레드크럼 | 소개 | About |
| `nav.projects` | 상단 메뉴·브레드크럼 | 프로젝트 | Projects |
| `nav.archives` | 상단 메뉴·브레드크럼 | 아카이브 | Archives |
| `nav.search` | 상단 메뉴·브레드크럼 | 검색 | Search |
| `post.publishedAt` | 글 페이지 | 발행 | Published at |
| `post.updatedAt` | 글 페이지 | 수정 | Updated |
| `post.sharePostIntro` | 글 페이지 | 이 글 공유하기: | Share this post: |
| `post.sharePostOn` | 글 페이지 | {{platform}}에 공유 | Share this post on {{platform}} |
| `post.sharePostViaEmail` | 글 페이지 | 이메일로 공유 | Share this post via email |
| `post.tagLabel` | 글 페이지 | 태그 | Tags |
| `post.backToTop` | 글 페이지 | 맨 위로 | Back to top |
| `post.goBack` | 글 페이지 | 뒤로 | Go back |
| `post.editPage` | 글 페이지 | 글 고치기 | Edit page |
| `post.previousPost` | 글 페이지 | 이전 글 | Previous Post |
| `post.nextPost` | 글 페이지 | 다음 글 | Next Post |
| `post.views` | 글 페이지 | {{count}} 읽음 | {{count}} views |
| `post.series` | 글 페이지 | 시리즈 | Series |
| `post.seriesPart` | 글 페이지 | {{total}}편 중 {{current}}편 | Part {{current}} of {{total}} |
| `post.readInOtherLanguage` | 글 페이지 | 영어로 읽을래요 | Read in Korean |
| `interactions.commentsTitle` | 댓글 영역 | 댓글 | Comments |
| `interactions.commentsPending` | 댓글 영역 | GitHub Discussions 연결 후 댓글이 열립니다. | Comments will open once GitHub Discussions is connected. |
| `globe.title` | 글 지도 위젯 | 글 지도 | Post map |
| `globe.open` | 글 지도 위젯 | 글 지도 열기 | Open post map |
| `globe.close` | 글 지도 위젯 | 닫기 | Close |
| `globe.spin` | 글 지도 위젯 | 회전 | Spin |
| `globe.count` | 글 지도 위젯 | {{count}}편 | {{count}} posts |
| `pagination.prev` | 목록 아래 페이지 이동 | 이전 | Prev |
| `pagination.next` | 목록 아래 페이지 이동 | 다음 | Next |
| `pagination.page` | 목록 아래 페이지 이동 | 페이지 | Page |
| `home.heroTitle` | 홈 화면 | 안녕하세요, 개발자 이정현입니다. | Hello, I'm Junghyun Lee, a developer. |
| `home.heroText` | 홈 화면 | 저를 기록합니다. | This is where I record myself. |
| `home.socialLinks` | 홈 화면 | 링크 | Social Links |
| `home.featured` | 홈 화면 | 추천 글 | Featured |
| `home.recentPosts` | 홈 화면 | 최근 글 | Recent Posts |
| `home.allPosts` | 홈 화면 | 전체 글 | All Posts |
| `footer.copyright` | 하단 | Copyright | Copyright |
| `footer.allRightsReserved` | 하단 | All rights reserved. | All rights reserved. |
| `footer.totalVisits` | 하단 | 전체 방문 {{count}} | {{count}} visitors |
| `pages.tagTitle` | 목록 페이지 제목·설명 | 태그 | Tag |
| `pages.tagDesc` | 목록 페이지 제목·설명 | 이 태그가 붙은 글 | All the articles with the tag |
| `pages.tagsTitle` | 목록 페이지 제목·설명 | 태그 | Tags |
| `pages.tagsDesc` | 목록 페이지 제목·설명 | 글에 쓰인 태그 전체입니다. | All the tags used in posts. |
| `pages.postsTitle` | 목록 페이지 제목·설명 | 글 | Posts |
| `pages.postsDesc` | 목록 페이지 제목·설명 | 지금까지 쓴 글 전체입니다. | All the articles I've posted. |
| `pages.archivesTitle` | 목록 페이지 제목·설명 | 아카이브 | Archives |
| `pages.archivesDesc` | 목록 페이지 제목·설명 | 연도·월별로 모은 글입니다. | All the articles I've archived. |
| `pages.searchTitle` | 목록 페이지 제목·설명 | 검색 | Search |
| `pages.searchDesc` | 목록 페이지 제목·설명 | 글을 검색합니다. | Search any article ... |
| `a11y.skipToContent` | 스크린리더·툴팁 (화면에 거의 안 보임) | 본문으로 건너뛰기 | Skip to content |
| `a11y.openMenu` | 스크린리더·툴팁 (화면에 거의 안 보임) | 메뉴 열기 | Open menu |
| `a11y.closeMenu` | 스크린리더·툴팁 (화면에 거의 안 보임) | 메뉴 닫기 | Close menu |
| `a11y.toggleTheme` | 스크린리더·툴팁 (화면에 거의 안 보임) | 테마 전환 | Toggle theme |
| `a11y.searchPlaceholder` | 스크린리더·툴팁 (화면에 거의 안 보임) | 검색어를 입력하세요 | Search posts... |
| `a11y.noResults` | 스크린리더·툴팁 (화면에 거의 안 보임) | 결과가 없습니다 | No results found |
| `a11y.goToPreviousPage` | 스크린리더·툴팁 (화면에 거의 안 보임) | 이전 페이지 | Go to previous page |
| `a11y.goToNextPage` | 스크린리더·툴팁 (화면에 거의 안 보임) | 다음 페이지 | Go to next page |
| `notFound.title` | 404 페이지 | 404 페이지 없음 | 404 Not Found |
| `notFound.message` | 404 페이지 | 페이지를 찾을 수 없습니다 | Page Not Found |
| `notFound.goHome` | 404 페이지 | 홈으로 | Go back home |
