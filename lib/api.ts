export const API_URL = "http://localhost:8000/api";

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    return []; // Return empty array to prevent reduce errors on null
  }
}
