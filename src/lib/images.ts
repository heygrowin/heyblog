/**
 * Hero image resolution.
 *
 * The content contract keeps `heroImage` a plain public-looking string
 * ("/images/foo.jpg") because that is what the engine writes, but the file
 * itself lives in src/assets/images/ so Astro can emit AVIF/WebP at several
 * widths with intrinsic dimensions. This maps one to the other.
 */

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpeg,jpg,png,webp,avif,gif}',
);

const ASSET_DIR = '/src/assets/images/';

/** Resolves a heroImage path to an optimisable image, or fails the build saying why. */
export async function resolveHeroImage(heroImage: string, postSlug: string): Promise<ImageMetadata> {
  const filename = heroImage.replace(/^\/images\//, '');
  const key = `${ASSET_DIR}${filename}`;
  const loader = images[key];

  if (!loader) {
    const available = Object.keys(images)
      .map((k) => `  /images/${k.slice(ASSET_DIR.length)}`)
      .sort();

    throw new Error(
      `Missing hero image.\n\n` +
        `  Post:      ${postSlug}\n` +
        `  Requested: ${heroImage}\n` +
        `  Expected:  src/assets/images/${filename}\n\n` +
        `Hero images are optimised at build time, so the file must live in\n` +
        `src/assets/images/ — not public/images/. See CONTENT_SCHEMA.md.\n\n` +
        (available.length
          ? `Images currently available:\n${available.join('\n')}\n`
          : `There are no images in src/assets/images/ yet.\n`),
    );
  }

  return (await loader()).default;
}
