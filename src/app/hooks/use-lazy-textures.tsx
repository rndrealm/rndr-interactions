import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { ImageBitmapLoader, SRGBColorSpace, Texture } from "three";

/**
 * Loads a whole set of textures at once and returns them positionally, so a
 * caller can reach any item's texture rather than only its own. Repeated URLs
 * decode once and share a Texture — safe here because every per-card difference
 * (cover fit, card size) lives in uniforms, not on the texture object.
 */
export function useLazyTextures(urls: string[]) {
  const gl = useThree((s) => s.gl);
  // Collapse to a primitive so passing a fresh array of the same URLs on every
  // render doesn't retrigger the whole load.
  const key = urls.join("\n");
  const [byUrl, setByUrl] = useState<Record<string, Texture<ImageBitmap>>>({});

  useEffect(() => {
    let cancelled = false;
    const created: Texture<ImageBitmap>[] = [];

    const loader = new ImageBitmapLoader();
    // Texture.flipY is *ignored* for ImageBitmap — orientation has to be baked
    // in at decode time, or the plane renders upside down.
    loader.setOptions({ imageOrientation: "flipY" });
    loader.setCrossOrigin("anonymous");

    for (const url of new Set(key.split("\n"))) {
      loader.load(
        url,
        (bitmap) => {
          if (cancelled) {
            // The decode finished after we unmounted; nothing will free this.
            bitmap.close();
            return;
          }

          const t = new Texture(bitmap);
          t.colorSpace = SRGBColorSpace;
          t.needsUpdate = true;
          // Decoding off-thread doesn't help the GPU upload — that still lands
          // on the main thread, on whatever frame first draws the texture.
          gl.initTexture(t);

          created.push(t);
          setByUrl((prev) => ({ ...prev, [url]: t }));
        },
        undefined,
        () => {
          console.warn(`[parallax] texture failed: ${url}`);
        },
      );
    }

    return () => {
      cancelled = true;
      for (const t of created) {
        t.image.close();
        t.dispose();
      }
      setByUrl({});
    };
  }, [key, gl]);

  return useMemo(
    () => key.split("\n").map((url) => byUrl[url] ?? null),
    [key, byUrl],
  );
}
