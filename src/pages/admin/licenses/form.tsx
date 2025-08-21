import * as React from "react";
import { useState, useEffect } from "react";
import CustomForm from "@/components/custom/Input/CustomForm";
import CustomInput from "@/components/custom/Input/CustomInput";
import { useTranslation } from "react-i18next";

export default function Form({
  data,
  open,
  onOpenChange,
  onSubmit,
}: {
  data?: any;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (formData: any) => void;
}) {
  const { t } = useTranslation("general");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        description: data.description || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ ...formData });
  };

  return (
    <CustomForm
      open={open}
      onOpenChange={onOpenChange}
      title={data ? t("edit_license") : t("create_license")}
      description={
        data
          ? t("update_license_details")
          : t("fill_create_license")
      }
      onSubmit={handleSubmit}
    >
      <>
        <CustomInput
          name="name"
          label={t("name")}
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
          disabled={loading}
          required
        />
        <CustomInput
          name="description"
          label={t("description")}
          value={formData.description}
          onChange={(value) => handleChange("description", value)}
          disabled={loading}
        />
      </>
    </CustomForm>
  );
}