/* The deployment's basePath, for building asset URLs by hand.

   GitHub Pages serves this project from /peptidechecker/, and next/image does NOT prefix
   basePath onto its src when `images.unoptimized` is set - verified against the built output,
   where "/images/foo.jpg" shipped unprefixed and would have 404'd on the live site. Link and
   router hrefs ARE prefixed automatically; only raw asset paths need this.

   Read from the same BASE_PATH env var next.config.ts uses, so local dev (unset) and the
   Pages build stay consistent. */
export const BASE = process.env.BASE_PATH ?? "";

/** Prefix a public/ asset path with the deployment basePath. */
export function asset(path: string): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
