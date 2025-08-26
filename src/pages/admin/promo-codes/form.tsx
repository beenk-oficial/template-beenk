import * as React from "react";
import { useState, useEffect } from "react";
import CustomForm from "@/components/custom/Input/CustomForm";
import CustomInput from "@/components/custom/Input/CustomInput";
import { useTranslation } from "react-i18next";
import CustomSelect from "@/components/custom/Input/CustomSelect";
import { getPromoCodesPaginated } from "@/lib/supabase/api/admin/promo-codes";
import { SortOrder } from "@/types";
import CustomDateTimePicker from "@/components/custom/Input/CustomDateTimePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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

  function generatePromoCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async function getUniquePromoCode() {
    const code = generatePromoCode();
    const response = await getPromoCodesPaginated({ search: code, sortOrder: SortOrder.ASC });
    const exists = response?.data?.some((item: any) => item.code === code);
    if (exists) return await getUniquePromoCode();
    return code;
  }

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    usage_limit: 1,
    total_usage_limit: 1000,
    expires_at: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        code: data.code || "",
        description: data.description || "",
        discount_type: data.discount_type || "percentage",
        discount_value: data.discount_value || 0,
        usage_limit: data.usage_limit || 1,
        total_usage_limit: data.total_usage_limit || 1000,
        expires_at: data.expires_at ? data.expires_at.slice(0, 16) : "",
      });
    } else {
      getUniquePromoCode().then((uniqueCode) => {
        setFormData((prev: any) => ({ ...prev, code: uniqueCode }));
      });
    }
  }, [data, open]);

  useEffect(() => {
    if (!open) {
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        usage_limit: 1,
        total_usage_limit: 1000,
        expires_at: "",
      });
    }
  }, [open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) onSubmit({
      ...formData,
      expires_at: formData.expires_at
    });
  };

  return (
    <CustomForm
      open={open}
      onOpenChange={onOpenChange}
      title={data ? t("edit_promo_code") : t("create_promo_code")}
      description={
        data
          ? t("update_promo_code_details")
          : t("fill_create_promo_code")
      }
      onSubmit={handleSubmit}
    >
      <>
        <CustomInput
          name="code"
          label={t("code")}
          value={formData.code}
          onChange={(value) => handleChange("code", value)}
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

        <CustomSelect
          name="discount_type"
          label={t("discount_type")}
          value={formData.discount_type}
          onChange={(value) => handleChange("discount_type", value)}
          options={[
            { value: "percentage", label: t("percentage") },
            { value: "fixed", label: t("fixed") },
          ]}
          disabled={loading}
          required
        />

        <CustomInput
          name="discount_value"
          label={t("discount_value")}
          type="number"
          value={formData.discount_value}
          onChange={(value) => handleChange("discount_value", value)}
          disabled={loading}
          required
        />

        <CustomInput
          name="usage_limit"
          label={t("usage_limit")}
          type="number"
          value={formData.usage_limit}
          onChange={(value) => handleChange("usage_limit", value)}
          disabled={loading}
          required
        />

        <CustomInput
          name="total_usage_limit"
          label={t("total_usage_limit")}
          type="number"
          value={formData.total_usage_limit}
          onChange={(value) => handleChange("total_usage_limit", value)}
          disabled={loading}
          required
        />

        <CustomDateTimePicker
          name="expires_at"
          label={t("expires_at")}
          value={formData.expires_at || undefined}
          onChange={(value) => handleChange("expires_at", value)}
          disabled={loading}
        />
      </>
    </CustomForm>
  );
}
