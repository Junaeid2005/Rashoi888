/**
 * Resolves static image URLs across development and Vercel production environments.
 * Converts old '/src/assets/images/...' references (or raw filenames) to stable '/images/...' paths.
 */
export function resolveAssetUrl(url?: string | null, fallback: string = '/images/rashoi_hero_cuisine_1794139786997.jpg'): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  const clean = url.trim();

  // If already full remote URL or data URI, return as-is
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }

  // Handle old '/src/assets/images/filename.jpg' or 'src/assets/images/filename.jpg'
  if (clean.includes('/src/assets/images/') || clean.includes('src/assets/images/')) {
    const filename = clean.split('/').pop();
    return `/images/${filename}`;
  }

  // If starts with /images/
  if (clean.startsWith('/images/')) {
    return clean;
  }

  // If starts with images/
  if (clean.startsWith('images/')) {
    return `/${clean}`;
  }

  // If it's a bare rashoi_ filename
  if (clean.startsWith('rashoi_')) {
    return `/images/${clean}`;
  }

  return clean;
}
