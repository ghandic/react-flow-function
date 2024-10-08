import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance } from "tippy.js";
import MentionList from "./mention-list";

const suggestion = (choice: string[]) => ({
  items: ({ query }: { query: string }) => {
    return choice
      .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer | undefined;
    let popup: Instance[] | undefined;

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props) {
        if (component) {
          component.updateProps(props);
        }

        if (props.clientRect && popup) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        }
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          if (popup) {
            popup[0].hide();
          }
          return true;
        }

        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup) {
          popup[0].destroy();
          popup = undefined; // Clear the reference
        }
        if (component) {
          component.destroy();
          component = undefined; // Clear the reference
        }
      },
    };
  },
});

export default suggestion;
