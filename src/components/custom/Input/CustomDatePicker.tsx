import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import CustomInputGroup from "./CustomInputGroup"
import { useTranslation } from "react-i18next"

interface CustomDatePickerProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: Date;
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onChange: (value: Date) => void;
}

export default function CustomDatePicker({
  id,
  placeholder,
  name,
  value,
  label,
  htmlFor,
  required,
  error,
  disabled,
  onChange,
}: CustomDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const { t } = useTranslation("general");

  return (
    <CustomInputGroup
      label={label}
      htmlFor={htmlFor ?? name}
      error={error}
      required={required}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            className="justify-between font-normal"
            disabled={disabled}

          >
            {value ? (new Date(value)).toLocaleDateString() : (placeholder ?? t("select_date"))}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            id={id ?? name}
            mode="single"
            selected={value}
            captionLayout="dropdown"
            disabled={disabled}
            onSelect={(date) => {
              onChange(date as Date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </CustomInputGroup>

  )
}
