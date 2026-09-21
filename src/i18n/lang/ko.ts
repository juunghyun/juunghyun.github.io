import type { UIStrings } from "../types";

export default {
  site: {
    description: "백엔드 개발자 이정현이 일하며 얻은 인사이트와 문제 해결 기록",
  },
  lang: {
    name: "한국어",
    switchTo: "English",
    noTranslation: "이 글은 아직 영어로 옮기지 않았습니다.",
  },
  nav: {
    home: "홈",
    posts: "글",
    tags: "태그",
    about: "소개",
    archives: "아카이브",
    search: "검색",
  },
  post: {
    publishedAt: "발행",
    updatedAt: "수정",
    sharePostIntro: "이 글 공유하기:",
    sharePostOn: "{{platform}}에 공유",
    sharePostViaEmail: "이메일로 공유",
    tagLabel: "태그",
    backToTop: "맨 위로",
    goBack: "뒤로",
    editPage: "글 고치기",
    previousPost: "이전 글",
    nextPost: "다음 글",
    views: "회 읽음",
    series: "시리즈",
    seriesPart: "{{total}}편 중 {{current}}편",
    readInOtherLanguage: "이 글을 영어로 읽기",
  },
  interactions: {
    commentsTitle: "댓글",
    commentsPending: "GitHub Discussions 연결 후 댓글이 열립니다.",
  },
  pagination: {
    prev: "이전",
    next: "다음",
    page: "페이지",
  },
  home: {
    heroTitle: "안녕하세요.",
    heroText:
      "Kotlin과 Spring, 이벤트 기반 시스템을 다루는 백엔드 개발자 이정현입니다. 일하며 부딪힌 문제와 그 원인, 해결하면서 배운 것을 제 언어로 기록합니다. 모든 글은 영어로도 읽을 수 있습니다.",
    socialLinks: "링크",
    featured: "추천 글",
    recentPosts: "최근 글",
    allPosts: "전체 글",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "태그",
    tagDesc: "이 태그가 붙은 글",

    tagsTitle: "태그",
    tagsDesc: "글에 쓰인 태그 전체입니다.",

    postsTitle: "글",
    postsDesc: "지금까지 쓴 글 전체입니다.",

    archivesTitle: "아카이브",
    archivesDesc: "연도·월별로 모은 글입니다.",

    searchTitle: "검색",
    searchDesc: "글을 검색합니다.",
  },
  a11y: {
    skipToContent: "본문으로 건너뛰기",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    toggleTheme: "테마 전환",
    searchPlaceholder: "검색어를 입력하세요",
    noResults: "결과가 없습니다",
    goToPreviousPage: "이전 페이지",
    goToNextPage: "다음 페이지",
  },
  notFound: {
    title: "404 페이지 없음",
    message: "페이지를 찾을 수 없습니다",
    goHome: "홈으로",
  },
} satisfies UIStrings;
