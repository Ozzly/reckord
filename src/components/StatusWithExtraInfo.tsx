import React from "react";
import type { GenericStatus } from "../types.js";
import StatusButton from "./StatusButton.js";
import NumberInputWithButtons from "./NumberInputWithButtons.js";

interface StatusWithExtraInfoProps {
  status: GenericStatus | null;
  dateAdded: string | null;
  count: number | null;
  maxCount: number | null;
  buttonText: string;
  onStatusChange: (status: GenericStatus | null) => void;
  onCountChange: (newCount: number) => void;
  statusOptions: {
    completed: string;
    progress: string;
    planned: string;
  };
}

function StatusWithExtraInfo({
  status,
  dateAdded,
  count,
  maxCount,
  buttonText,
  onStatusChange,
  onCountChange,
  statusOptions,
}: StatusWithExtraInfoProps) {
  return (
    <>
      {status === "completed" ? (
        <div className="text-ctp-subtext0 text-center">
          Finished {dateAdded}
        </div>
      ) : status === "planned" ? (
        <div className="text-ctp-subtext0 text-center">Added {dateAdded}</div>
      ) : (
        status === "progress" && (
          <div className="text-ctp-subtext0 text-center justify-center items-center flex">
            <div className="hidden group-hover/card:flex justify-center mr-1">
              <NumberInputWithButtons
                count={count || 0}
                setCount={onCountChange}
                maxCount={maxCount || 0}
              />
            </div>
            <div className="group-hover/card:hidden mr-1">{count}</div>
            of {maxCount || "?"}
          </div>
        )
      )}
      <StatusButton
        currentStatus={status}
        handleStatusChange={onStatusChange}
        buttonText={buttonText}
        statusOptions={statusOptions}
      />
    </>
  );
}

export default StatusWithExtraInfo;
