export interface UIStrings {
  site: {
    /** 언어별 사이트 설명. meta description·RSS·OG 에 쓴다. */
    description: string;
  };
  lang: {
    /** 이 언어의 이름 (언어 전환 링크 라벨용) */
    name: string;
    /** 다른 언어로 전환하는 링크 라벨 */
    switchTo: string;
  };
  nav: {
    home: string;
    posts: string;
    tags: string;
    about: string;
    projects: string;
    archives: string;
    search: string;
  };
  post: {
    publishedAt: string;
    updatedAt: string;
    sharePostIntro: string;
    sharePostOn: string;
    sharePostViaEmail: string;
    tagLabel: string;
    backToTop: string;
    goBack: string;
    editPage: string;
    previousPost: string;
    nextPost: string;
    /** "{{count}}" 자리에 조회수가 들어간다 */
    views: string;
    series: string;
    seriesPart: string;
    readInOtherLanguage: string;
  };
  interactions: {
    commentsTitle: string;
    commentsPending: string;
  };
  pagination: {
    prev: string;
    next: string;
    page: string;
  };
  home: {
    heroTitle: string;
    heroText: string;
    socialLinks: string;
    featured: string;
    recentPosts: string;
    allPosts: string;
  };
  footer: {
    copyright: string;
    allRightsReserved: string;
    /** "{{count}}" 자리에 사이트 전체 방문 수가 들어간다 */
    totalVisits: string;
  };
  pages: {
    tagTitle: string;
    tagDesc: string;

    tagsTitle: string;
    tagsDesc: string;

    postsTitle: string;
    postsDesc: string;

    archivesTitle: string;
    archivesDesc: string;

    searchTitle: string;
    searchDesc: string;
  };
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    toggleTheme: string;
    searchPlaceholder: string;
    noResults: string;
    goToPreviousPage: string;
    goToNextPage: string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
}
