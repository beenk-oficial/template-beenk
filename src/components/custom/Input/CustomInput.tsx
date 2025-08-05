import React from "react";
import { Input } from "@/components/ui/input";
import CustomInputGroup from "./CustomInputGroup";

interface CustomInputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  additionalElement?: React.ReactNode;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const CustomInput: React.FC<CustomInputProps> = ({
  id,
  name,
  type = "text",
  placeholder = "",
  value,
  label,
  htmlFor,
  error = "",
  required = false,
  disabled = false,
  onChange,
  additionalElement,
  onKeyDown,
  icon,
}) => {
  return (
    <CustomInputGroup
      label={label}
      htmlFor={htmlFor ?? name}
      error={error}
      required={required}
      additionalElement={additionalElement}
    >
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-2 flex items-center border-r pr-2">
            {icon}
          </span>
        )}
        <Input
          id={id ?? name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={icon ? `pl-9` : ""}
        />
      </div>
    </CustomInputGroup>
  );
};

export default CustomInput;
