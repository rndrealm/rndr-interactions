import React, { Fragment, RefObject, useRef } from "react";
import { Vector2 } from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { DomApi } from "@/app/parallax/page";
import vertexShader from "../../shaders/parallax/vertex.glsl";
import fragmentShader from "../../shaders/parallax/fragment.glsl";
import { ParallaxPlane, type ParallaxMesh } from "./plane";
import { IMAGE_ULRS } from "@/app/parallax/dom/page";

export const ParallaxMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uTextureLoaded: 0,
    uCardSize: new Vector2(1),
    uImageSize: new Vector2(1),
    uParallax: 0,
  },
  vertexShader,
  fragmentShader,
);

extend({ ParallaxMaterial });

interface IProps {
  domApi: RefObject<DomApi | null>;
}

export function Experience(props: IProps) {
  const { domApi } = props;

  const meshRefs = useRef<(ParallaxMesh | null)[]>([]);

  useFrame((state) => {
    const { size } = state;

    const planes = domApi.current?.planesInfo;

    const scrollY = window.scrollY;

    if (planes) {
      for (let i = 0; i < meshRefs.current.length; i++) {
        const domPlane = planes[i];
        const webglPlane = meshRefs.current[i];

        const width = domPlane.rect.width;
        const height = domPlane.rect.height;

        const posX = domPlane.rect.left - size.width * 0.5 + width * 0.5;
        const posY = -domPlane.rect.top + size.height * 0.5 - height * 0.5;

        webglPlane?.scale.set(width, height);
        // Set directly, no damping: the DOM moves at raw native scroll speed, so
        // any easing here shows up as the meshes trailing and then snapping.
        webglPlane?.position.set(posX, posY + scrollY, 0);
        webglPlane?.material.uniforms.uCardSize.value.set(width, height);

        const domTop = domPlane.rect.top - scrollY;
        const domBottom = domTop + height;

        // Overlap, not containment: a plane half off the top edge is still on
        // screen. The margin keeps a plane updating just before it enters, so
        // it never pops in with a stale parallax offset.
        const margin = height * 0.25;

        // const isOffScreen = domBottom < 0 || domTop > size.height;
        const isVisible = domBottom > -margin && domTop < size.height + margin;

        // Skipping the draw call entirely is the real win here — the uniform
        // write is nearly free by comparison.
        if (webglPlane) webglPlane.visible = isVisible;

        if (isVisible && webglPlane) {
          const elementCenter = domTop + height * 0.5;
          const viewportCenter = size.height / 2;
          const distance = (elementCenter - viewportCenter) / size.height;

          webglPlane.material.uniforms.uParallax.value = distance * 0.5;
        }
      }
    }
  });

  return (
    <Fragment>
      {domApi?.current?.planesInfo?.map((item) => {
        return (
          <ParallaxPlane
            key={item?.index}
            ref={(el) => {
              meshRefs.current[item?.index] = el;
            }}
            url={IMAGE_ULRS[item?.index % IMAGE_ULRS.length]}
          />
        );
      })}
    </Fragment>
  );
}
