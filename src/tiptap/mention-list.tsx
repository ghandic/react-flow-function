import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

interface MentionListProps {
  items: string[];
  command: (item: { id: string }) => void;
}

const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  console.log(selectedIndex);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md flex flex-col gap-1 overflow-auto p-2 relative">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={cn(
              "flex items-center cursor-pointer p-2 bg-transparent gap-1 text-left w-full hover:bg-gray-300",
              index === selectedIndex ? "bg-gray-200" : ""
            )}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});

export default MentionList;
