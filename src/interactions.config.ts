/**
 * 상호작용 어댑터 설정.
 * 글과 레이아웃은 제공자를 모른다. 제공자를 바꾸려면 이 파일과 components/interactions 만 고친다.
 */
export interface InteractionsConfig {
  comments: {
    provider: "giscus";
    /** GitHub 레포 "owner/name". 공개 레포 + Discussions 활성화 필요 */
    repo: string;
    /** giscus.app 에서 발급받는 값. 비어 있으면 댓글 영역에 안내 문구만 보인다 */
    repoId: string;
    category: string;
    categoryId: string;
    /**
     * shared-slug: 한·영 글이 슬러그 하나로 Discussion 하나를 공유한다.
     * per-url: 언어별 URL 마다 Discussion 을 따로 만든다.
     */
    termStrategy: "shared-slug" | "per-url";
    reactionsEnabled: boolean;
  };
  views: {
    provider: "goatcounter";
    /** GoatCounter 사이트 코드. https://<code>.goatcounter.com */
    code: string;
  };
}

const interactions: InteractionsConfig = {
  comments: {
    provider: "giscus",
    repo: "juunghyun/juunghyun.github.io",
    repoId: "R_kgDOUkxvOg",
    category: "Announcements",
    categoryId: "DIC_kwDOUkxvOs4DGIO6",
    termStrategy: "shared-slug",
    reactionsEnabled: true,
  },
  views: {
    provider: "goatcounter",
    code: "",
  },
};

export const commentsEnabled = Boolean(
  interactions.comments.repoId && interactions.comments.categoryId
);
export const viewsEnabled = Boolean(interactions.views.code);

export default interactions;
