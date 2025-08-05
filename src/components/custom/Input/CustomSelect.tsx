import React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import CustomInputGroup from "./CustomInputGroup";

interface CustomSelectProps {
    name?: string;
    label?: string;
    htmlFor?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    additionalElement?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    name,
    label,
    htmlFor,
    value,
    placeholder,
    required = false,
    error,
    disabled = false,
    options,
    onChange,
    additionalElement,
}) => {
    return (
        <CustomInputGroup
            label={label}
            htmlFor={htmlFor ?? name}
            error={error}
            required={required}
            additionalElement={additionalElement}
        >
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                name={name}
            >
                <SelectTrigger id={name} className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CustomInputGroup>
    );
};

export default CustomSelect;
