const RETURN_URL_PARAM = "returnUrl";

export function buildUrlWithReturn(
  targetPath: string,
  currentPath?: string,
): string {
  const returnPath =
    currentPath ??
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "");

  if (!returnPath || returnPath === "/") {
    return targetPath;
  }

  if (returnPath === targetPath || returnPath.startsWith(targetPath + "?")) {
    return targetPath;
  }

  const separator = targetPath.includes("?") ? "&" : "?";
  return `${targetPath}${separator}${RETURN_URL_PARAM}=${encodeURIComponent(returnPath)}`;
}

export function getReturnUrl(fallback = "/dashboard"): string {
  if (typeof window === "undefined") return fallback;

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get(RETURN_URL_PARAM);

  if (!returnUrl) return fallback;

  const decoded = decodeURIComponent(returnUrl);
  if (decoded.startsWith("/") && !decoded.startsWith("//")) {
    return decoded;
  }

  return fallback;
}
