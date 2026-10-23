export type OsName = "windows" | "macos" | "linux" | "chromeos" | "android" | "unknown";

export interface OsHints {
  userAgent?: string;
  platform?: string;
}

/** Prefer User-Agent Client Hints, then the UA string. */
export function detectOs(hints: OsHints): OsName {
  const platform = (hints.platform ?? "").toLowerCase();
  const agent = (hints.userAgent ?? "").toLowerCase();
  const blob = `${platform} ${agent}`;
  if (blob.includes("cros") || blob.includes("chrome os") || blob.includes("chromeos"))
    return "chromeos";
  if (blob.includes("android")) return "android";
  if (blob.includes("win")) return "windows";
  if (blob.includes("mac") || blob.includes("iphone") || blob.includes("ipad")) return "macos";
  if (blob.includes("linux")) return "linux";
  return "unknown";
}

export function detectOsFromNavigator(nav: {
  userAgent?: string;
  userAgentData?: { platform?: string };
}): OsName {
  return detectOs({
    platform: nav.userAgentData?.platform,
    userAgent: nav.userAgent,
  });
}
