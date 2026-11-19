// Preserve the original CMS override keys while migrating the default video sources.
const aliases: Record<string, string> = {
  "https://player.mux.com/Y3F012sQhPnzsbQeqwKFnbR9c2UAmoEabZR8RKe1HupU?player=mux-player&video-title=%20&thumbnail-time=10&preload=none": "/assets/videos/doctor-introduction.mp4",
  "https://next.frame.io/share/acca1aa2-1ce9-4d17-8f4d-e012dfc7f4ba/view/fbe45912-e622-4b35-8e5d-ca24ec347ff6": "/assets/videos/website-walkthrough.mp4",
};
export function migratedMediaSource(source: string) { return aliases[source] ?? source; }
export function isMigratedVideo(source: string) { return Object.values(aliases).includes(source); }
