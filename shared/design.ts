// shared/designs.ts
export type DesignKey = "plain" | "girl" | "kinmokusei" | "usaCarrot";

export const CARD_DESIGNS: Record<
  DesignKey,
  {
    bgColor: string;
    image?: string;
    mode?: "cover" | "contain";
  }
> = {
  plain: {
    bgColor: "#e2c7a3",
  },
  girl: {
    bgColor: "#e9edf5",
    image: "/girl.png",
    mode: "cover",
  },
  kinmokusei: {
    bgColor: "#fff5e5",
    image: "/kinmokusei.png",
    mode: "cover",
  },
  usaCarrot: {
    bgColor: "#ffffff",
    image: "/usa-carrot.png",
    mode: "contain",
  },
};
