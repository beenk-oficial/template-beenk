import * as React from "react";
import { useState, useEffect } from "react";
import type { User, UserType } from "@/types";
import CustomForm from "@/components/custom/Input/CustomForm";
import CustomInput from "@/components/custom/Input/CustomInput";
import { useTranslation } from "react-i18next";
import CustomCheckbox from "@/components/custom/Input/CustomCheckbox";
import CustomSelect from "@/components/custom/Input/CustomSelect";

export default function Form({
  data,
  open,
  onOpenChange,
  onSubmit,
}: {
  data?: any;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (formData: Partial<User>) => void;
}) {
  const t = useTranslation("general") || ((key: string) => key);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    full_name: "",
    email: "",
    locale: "",
    birth_date: "",
    gender: "",
    nationality: "",
    document_type: "",
    document_number: "",
    show_onboarding: false,
    avatar_url: "",
    is_banned: false,
    is_active: false,
    type: UserType.USER,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        locale: data.locale || "",
        birth_date: data.birth_date || "",
        gender: data.gender || "",
        nationality: data.nationality || "",
        document_type: data.document_type || "",
        document_number: data.document_number || "",
        show_onboarding: data.show_onboarding || false,
        avatar_url: data.avatar_url || "",
        is_banned: data.is_banned || false,
        is_active: data.is_active || false,
        type: data.type || UserType.USER,
      });
    }
  }, [data]);

  const handleChange = (field: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const typeOptions = [
    { value: UserType.ADMIN, label: t("admin") },
    { value: UserType.USER, label: t("user") },
    { value: UserType.GUEST, label: t("guest") },
  ];

  return (
    <CustomForm
      open={open}
      onOpenChange={onOpenChange}
      title={data ? t("edit_user") : t("create_user")}
      description={
        data
          ? t("update_user_details")
          : t("fill_create_user")
      }
      onSubmit={handleSubmit}
    >
      <>
        <CustomInput
          name="full_name"
          label={t("full_name")}
          value={formData.full_name}
          onChange={(value) => handleChange("full_name", value)}
          disabled={loading}
          required
        />

        <CustomInput
          name="email"
          label={t("email")}
          value={formData.email}
          onChange={(value) => handleChange("email", value)}
          disabled={loading}
          required
        />
        
        <CustomSelect
          name="type"
          label={t("type")}
          value={formData.type}
          placeholder={t("select_type")}
          onChange={(value) => handleChange("type", value)}
          disabled={loading}
          options={typeOptions}
          required
        />

        <CustomCheckbox
          name="isActive"
          value={formData.is_active}
          label={t("is_active")}
          disabled={loading}
          onChange={(value) => handleChange("is_active", value)}
        />

        <CustomCheckbox
          name="isBanned"
          value={formData.is_banned}
          label={t("is_banned")}
          disabled={loading}
          onChange={(value) => handleChange("is_banned", value)}
        />


      </>
    </CustomForm>
  );
}
