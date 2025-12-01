import { DropdownMenu } from "radix-ui";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { MdCancel } from "react-icons/md";
import type { GenericStatus } from "../types.js";

interface StatusButtonProps {
  currentStatus: GenericStatus | null;
  handleStatusChange: (status: GenericStatus | null) => void;
  buttonText: string;
  statusOptions: {
    completed: string;
    progress: string;
    planned: string;
  };
}

function StatusButton({
  currentStatus,
  handleStatusChange,
  buttonText,
  statusOptions,
}: StatusButtonProps) {
  function getMainButtonStyle() {
    const baseStyle =
      "border-3 text-ctp-base rounded-l-lg p-1 border-r-2 w-full transition-all duration-400 hover:brightness-115 active:brightness-90 group";

    switch (currentStatus) {
      case "completed":
        return `${baseStyle} bg-ctp-blue border-ctp-blue`;
      case "progress":
        return `${baseStyle} bg-ctp-peach border-ctp-peach`;
      case "planned":
        return `${baseStyle} bg-ctp-red border-ctp-red`;
      default:
        return `${baseStyle} bg-ctp-mauve border-ctp-mauve`;
    }
  }

  function getDropdownButtonStyle() {
    const baseStyle =
      "border-3 border-l-2 rounded-r-lg p-1 px-2 font-bold transition-all duration-400 hover:brightness-115 active:brightness-90";

    switch (currentStatus) {
      case "completed":
        return `${baseStyle} border-ctp-blue text-ctp-blue hover:bg-ctp-blue/20`;
      case "progress":
        return `${baseStyle} border-ctp-peach text-ctp-peach hover:bg-ctp-peach/20`;
      case "planned":
        return `${baseStyle} border-ctp-red text-ctp-red hover:bg-ctp-red/20`;
      default:
        return `${baseStyle} border-ctp-mauve text-ctp-mauve hover:bg-ctp-mauve/20`;
    }
  }

  return (
    <div className="flex">
      <button
        className={getMainButtonStyle()}
        onClick={() => {
          if (currentStatus) {
            handleStatusChange(null);
          } else {
            handleStatusChange("completed");
          }
        }}
      >
        {buttonText}

        {currentStatus && (
          <MdCancel
            height={18}
            width={18}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-400 font-bold"
          />
        )}
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={getDropdownButtonStyle()}>
          <PiDotsThreeOutlineVerticalFill />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-ctp-base p-2 rounded-lg shadow-lg border-ctp-surface1 border-3 text-ctp-text"
            side="top"
            align="end"
          >
            <DropdownMenu.Label />
            <DropdownMenu.Item />

            <DropdownMenu.RadioGroup>
              <DropdownMenu.RadioItem
                value="completed"
                className="hover:bg-ctp-surface1 p-1 rounded-md"
                onClick={() => handleStatusChange("completed")}
              >
                Mark as {statusOptions.completed}
                <DropdownMenu.ItemIndicator />
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                value="progress"
                className="hover:bg-ctp-surface2 p-1 rounded-md"
                onClick={() => handleStatusChange("progress")}
              >
                Mark as {statusOptions.progress}
                <DropdownMenu.ItemIndicator />
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                value="planned"
                className="hover:bg-ctp-surface2 p-1 rounded-md"
                onClick={() => handleStatusChange("planned")}
              >
                Mark as {statusOptions.planned}
                <DropdownMenu.ItemIndicator />
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

export default StatusButton;
