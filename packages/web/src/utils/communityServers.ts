import type { CommunityServerSlug } from "../store/serverStore";

export const DEFAULT_COMMUNITY_SERVER_SLUG: CommunityServerSlug = "community";
export const CHINESE_COMMUNITY_SERVER_SLUG: CommunityServerSlug = "community-cn";

const CHINESE_LANGUAGE_RE = /^zh(?:-|$)/i;

export function languageListPrefersChineseCommunity(languages: Array<string | null | undefined>) {
  return languages.some((language) => typeof language === "string" && CHINESE_LANGUAGE_RE.test(language));
}

export function browserPrefersChineseCommunity() {
  if (typeof navigator === "undefined") return false;
  const languages = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter((language): language is string => typeof language === "string" && language.length > 0);
  return languageListPrefersChineseCommunity(languages);
}

export function hasJoinedCommunity(servers: Array<{ slug: string }>, slug: CommunityServerSlug) {
  return servers.some((server) => server.slug === slug);
}

export function recommendedCommunitySlugForLanguages(
  servers: Array<{ slug: string }>,
  languages: Array<string | null | undefined>,
) {
  if (languageListPrefersChineseCommunity(languages) && !hasJoinedCommunity(servers, CHINESE_COMMUNITY_SERVER_SLUG)) {
    return CHINESE_COMMUNITY_SERVER_SLUG;
  }
  return DEFAULT_COMMUNITY_SERVER_SLUG;
}

export function recommendedCommunitySlug(servers: Array<{ slug: string }>) {
  if (typeof navigator === "undefined") return DEFAULT_COMMUNITY_SERVER_SLUG;
  return recommendedCommunitySlugForLanguages(servers, [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ]);
}
