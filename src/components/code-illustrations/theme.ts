import { PrismTheme } from "prism-react-renderer";

export const codeTheme: PrismTheme = {
  plain: {
    color: "#e1e4e8",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#6b737c",
        fontStyle: "italic",
      },
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ["string", "attr-value"],
      style: {
        color: "#9ecbff",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#e1e4e8",
      },
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "constant",
        "property",
        "regex",
        "inserted",
      ],
      style: {
        color: "#79b8ff",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name"],
      style: {
        color: "#7ee2b0",
      },
    },
    {
      types: ["function", "deleted"],
      style: {
        color: "#d2a8ff",
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "#d2a8ff",
      },
    },
    {
      types: ["tag", "selector"],
      style: {
        color: "#7ee787",
      },
    },
    {
      types: ["keyword"],
      style: {
        color: "#ff7b72",
        fontWeight: "bold",
      },
    },
    {
      types: ["class-name"],
      style: {
        color: "#d2a8ff",
      },
    },
    {
      types: ["variable"],
      style: {
        color: "#ffa657",
      },
    },
  ],
};
