import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import DocumentSuggestionList from "./document-suggestion-list";
import type {
  DocumentItem,
  DocumentSuggestionListHandle,
} from "./document-suggestion-list";
import { ALL_DOCUMENTS } from "./document-data";

export const documentSuggestion: Omit<
  SuggestionOptions<DocumentItem>,
  "editor"
> = {
  char: "@",
  allowedPrefixes: null,
  placement: "top-start",
  offset: { mainAxis: 28, crossAxis: -16 },
  container: "body",
  items: ({ query }) =>
    ALL_DOCUMENTS.filter((doc) =>
      doc.label.toLowerCase().includes(query.toLowerCase()),
    ),
  render: () => {
    let component: ReactRenderer<DocumentSuggestionListHandle> | null = null;
    let unmount: (() => void) | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(DocumentSuggestionList, {
          props,
          editor: props.editor,
        });

        component.element.style.zIndex = "50";
        unmount = props.mount(component.element);
      },
      onUpdate: (props) => {
        component?.updateProps(props);
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        unmount?.();
        component?.destroy();
      },
    };
  },
};
