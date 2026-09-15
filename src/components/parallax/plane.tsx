import { useLazyTexture } from "@/app/hooks/use-lazy-texture";
import React, { forwardRef, useMemo } from "react";
import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from "three";

// The mesh always carries a ParallaxMaterial, so name the pair once and let both
// this file and Experience address `material.uniforms` without a cast.
export type ParallaxMesh = Mesh<PlaneGeometry, ShaderMaterial>;

interface IProps {
  url: string;
}

export const ParallaxPlane = forwardRef<ParallaxMesh, IProps>((props, ref) => {
  const { url } = props;
  const texture = useLazyTexture(url);

  const planeGeometry = useMemo(() => {
    return new PlaneGeometry(1, 1, 64, 64);
  }, []);

  // Memoised so a re-render doesn't hand the uniform a fresh Vector2 every time.
  const imageSize = useMemo(() => {
    const image = texture?.source.data;
    return new Vector2(image?.width ?? 1, image?.height ?? 1);
  }, [texture]);

  return (
    <mesh ref={ref} geometry={planeGeometry}>
      {/* @ts-ignore */}
      <parallaxMaterial
        uTexture={texture}
        uTextureLoaded={texture ? 1 : 0}
        uImageSize={imageSize}
      />
    </mesh>
  );
});

ParallaxPlane.displayName = "ParallaxPlane";
