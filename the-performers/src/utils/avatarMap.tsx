export const avatarMap: Record<number, string> = {
  0: "/avatars/fallback.png",
  1: "/avatars/1.jpg",
  2: "/avatars/2.jpg",
  3: "/avatars/3.jpg",
  4: "/avatars/4.jpg",
  5: "/avatars/5.jpg",
  6: "/avatars/6.jpg",
  7: "/avatars/7.jpg",
  8: "/avatars/8.jpg",
  9: "/avatars/9.jpg",
  10: "/avatars/10.jpg",
  11: "/avatars/11.jpg",
  12: "/avatars/12.jpg",
  13: "/avatars/13.jpg",
  14: "/avatars/14.jpg",
  15: "/avatars/15.jpg",
  16: "/avatars/16.jpg",
  17: "/avatars/17.jpg",
  18: "/avatars/18.jpg",
  19: "/avatars/19.jpg",
  20: "/avatars/20.jpg",
};

export function getAvatar(id?: number): string {
  // if id is undefined OR not in avatarMap → use fallback
  if (!id || !avatarMap[id]) {
    return "/avatars/fallback.png";
  }
  return avatarMap[id];
}