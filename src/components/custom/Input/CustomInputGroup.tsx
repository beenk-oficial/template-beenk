import React from "react";
import { Label } from "@/components/ui/label";

interface CustomInputProps {
  label?: string;
  htmlFor?: string;
  children?: React.ReactNode;
  error?: string;
  required?: boolean;
  additionalElement?: React.ReactNode;
  labelPosition?: "top" | "left";
}

const CustomInputGroup: React.FC<CustomInputProps> = ({
  label,
  htmlFor,
  children,
  error,
  required = false,
  additionalElement,
  labelPosition = "top",
}) => {
  return (
    <div className="grid gap-3 ">
      <div
        className={`gap-3 ${
          labelPosition === "left" ? "flex items-center " : "grid"
        }`}
      >
        {label && (
          <div
            className={`flex items-center ${
              labelPosition === "left" ? "order-last" : "order-first"
            }`}
          >
            <Label htmlFor={htmlFor}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {additionalElement && (
              <div className="ml-auto">{additionalElement}</div>
            )}
          </div>
        )}

        {children}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default CustomInputGroup;
