import React, { forwardRef } from "react";
import { BufferGeometry, Mesh, Vector2 } from "three";
import "./card-material";
import { useLazyTexture } from "@/app/hooks/use-lazy-texture";

interface IProps {
  geometry: BufferGeometry;
  textureUrl: string;
}

export const Plane = forwardRef<Mesh, IProps>((props: IProps, ref) => {
  const { geometry, textureUrl } = props;

  const texture = useLazyTexture(textureUrl);

  return (
    <mesh
      ref={ref}
      // ref={(el) => {
      //   if (!el) return;
      //   planeRefs.current[index] = {
      //     mesh: el as Mesh<BufferGeometry, CardMaterialImpl>,
      //     extraX: 0,
      //     extraY: 0,
      //     ease: 0,
      //     rect: { x: 0, y: 0, width: 0, height: 0 },
      //   };
      // }}
      geometry={geometry}
    >
      {/* @ts-ignore */}
      <cardMaterial
        uTexture={texture}
        uImageSize={
          new Vector2(texture?.source.data.width, texture?.source.data.height)
        }
        uTextureLoaded={texture ? 1 : 0}
      />
    </mesh>
  );
});

Plane.displayName = "Plane";
