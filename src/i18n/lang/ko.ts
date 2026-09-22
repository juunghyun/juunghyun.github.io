import type { UIStrings } from "../types";

export default {
  site: {
    description: "개발자 이정현을 기록",
  },
  lang: {
    name: "한국어",
    switchTo: "English",
  },
  nav: {
    home: "홈",
    posts: "글",
    tags: "태그",
    about: "소개",
    projects: "프로젝트",
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
    views: "{{count}} 읽음",
    series: "시리즈",
    seriesPart: "{{total}}편 중 {{current}}편",
    readInOtherLanguage: "영어로 읽을래요",
  },
  interactions: {
    commentsTitle: "댓글",
    commentsPending: "GitHub Discussions 연결 후 댓글이 열립니다.",
  },
  globe: {
    title: "글 지도",
    open: "글 지도 열기",
    close: "닫기",
    spin: "회전",
    count: "{{count}}편",
  },
  pagination: {
    prev: "이전",
    next: "다음",
    page: "페이지",
  },
  home: {
    heroTitle: "안녕하세요, 개발자 이정현입니다.",
    heroText: "저를 기록합니다.",
    socialLinks: "링크",
    featured: "추천 글",
    recentPosts: "최근 글",
    allPosts: "전체 글",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
    totalVisits: "전체 방문 {{count}}",
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
