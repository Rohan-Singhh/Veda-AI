export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function getBackendFileUrl(path: string): string {
  if (path.startsWith("http")) return path;

  const apiUrl = new URL(API_BASE);
  return `${apiUrl.origin}${path}`;
}
