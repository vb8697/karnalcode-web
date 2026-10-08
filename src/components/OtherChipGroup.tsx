"use client";

import { useState } from "react";
import { ChipGroup, TextField } from "@/components/ui";

type OtherChipGroupProps = {
  label: string;
  /** Include the "Other" option in this list; choosing it reveals a text box for a custom value. */
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  otherLabel?: string;
  customPlaceholder?: string;
  maxLength?: number;
};

/**
 * Chips plus a custom answer. Picking "Other" shows a text box, and what the person types becomes
 * the value. A saved value that is not one of the chips is shown in that box as well.
 */
export function OtherChipGroup({
  label,
  options,
  value,
  onChange,
  error,
  otherLabel = "Other",
  customPlaceholder,
  maxLength = 60,
}: OtherChipGroupProps) {
  const [otherPicked, setOtherPicked] = useState(false);
  const isOther = otherPicked || (value !== "" && !options.includes(value));

  function pick(option: string) {
    if (option === otherLabel) {
      setOtherPicked(true);
      if (options.includes(value)) onChange("");
      return;
    }
    setOtherPicked(false);
    onChange(option);
  }

  return (
    <div className="flex flex-col gap-3">
      <ChipGroup label={label} options={options} value={isOther ? otherLabel : value} onChange={pick} error={isOther ? undefined : error} />
      {isOther ? (
        <TextField
          label={`Your ${label.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          placeholder={customPlaceholder ?? `Type your ${label.toLowerCase()}`}
          maxLength={maxLength}
        />
      ) : null}
    </div>
  );
}
