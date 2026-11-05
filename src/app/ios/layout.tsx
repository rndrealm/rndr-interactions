import React from "react";
import { IosMotionConfig } from "./motion-config";

export default function Layout(props: { children: React.ReactNode }) {
  return <IosMotionConfig>{props.children}</IosMotionConfig>;
}
