import * as React from "react";
import { useState, useEffect } from "react";
import CustomForm from "@/components/custom/Input/CustomForm";
import CustomInput from "@/components/custom/Input/CustomInput";
import { useTranslation } from "react-i18next";
import CustomCheckbox from "@/components/custom/Input/CustomCheckbox";
import CustomSelect from "@/components/custom/Input/CustomSelect";
import { Card, CardContent } from "@/components/ui/card";
import { getLicenses } from "@/lib/supabase/api/admin/licenses";

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
  const [licenseOptions, setLicenseOptions] = useState<{ value: string; label: string }[]>([]);

  const [formData, setFormData] = useState<any>({
    name: "",
    license_id: "",
    monthly_price: 0,
    duration_months: 0,
    discount_percent: 0,
    is_active: true,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        license_id: data.license_id || "",
        monthly_price: data.monthly_price || 0,
        duration_months: data.duration_months || 0,
        discount_percent: data.discount_percent || 0,
        is_active: data.is_active ?? true,
      });
    }
  }, [data]);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        license_id: "",
        monthly_price: 0,
        duration_months: 0,
        discount_percent: 0,
        is_active: true,
      });
    }

    getLicenses().then((licenses) => {
      setLicenseOptions(licenses?.map((license) => ({
        value: license.id,
        label: license.name
      })) ?? []
      );
    });

  }, [open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit({
      ...formData,
      original_price: formData.monthly_price * formData.duration_months,
      discount_price: formData.monthly_price * formData.duration_months * (formData.discount_percent || 0) / 100
    });
  };

  return (
    <CustomForm
      open={open}
      onOpenChange={onOpenChange}
      title={data ? t("edit_plan") : t("create_plan")}
      description={
        data
          ? t("update_plan_details")
          : t("fill_create_plan")
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

        <CustomSelect
          name="license_id"
          label={t("license")}
          value={formData.license_id}
          onChange={(value) => handleChange("license_id", value)}
          options={licenseOptions}
          disabled={loading}
          required
        />

        <CustomInput
          name="monthly_price"
          label={t("monthly_price")}
          type="number"
          value={formData.monthly_price}
          onChange={(value) => handleChange("monthly_price", value)}
          disabled={loading}
          required
        />

        <CustomInput
          name="duration_months"
          label={t("duration_months")}
          type="number"
          value={formData.duration_months}
          onChange={(value) => handleChange("duration_months", value)}
          disabled={loading}
          required
        />

        <CustomInput
          name="discount_percent"
          label={`${t("discount_percent")} %`}
          type="number"
          value={formData.discount_percent}
          onChange={(value) => handleChange("discount_percent", value)}
          disabled={loading}
        />

        <CustomCheckbox
          name="is_active"
          value={formData.is_active}
          label={t("is_active")}
          disabled={loading}
          onChange={(value) => handleChange("is_active", value)}
        />

        <Card className="gap-0 p-0">
          <CardContent className="relative p-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium w-full">{t("monthly_price")}: {formData.monthly_price ? Number(formData.monthly_price).toLocaleString(undefined, { style: "currency", currency: "BRL" }) : "-"}
                </span>
              </div>
              <div>
                <span className="font-medium">{t("duration_months")}: </span>
                {formData.duration_months || "-"}
              </div>
              <div>
                <span className="font-medium">{t("discount_percent")}: </span>
                {formData.discount_percent ? `${formData.discount_percent}%` : "-"}
              </div>
              <div>
                <span className="font-medium">{t("discount_price")}: </span>
                {formData.monthly_price && formData.duration_months && formData.discount_percent
                  ? `${Number(formData.monthly_price * formData.duration_months * (formData.discount_percent / 100)).toLocaleString(undefined, { style: "currency", currency: "BRL" })}`
                  : "-"}
              </div>
              <div>
                <span className="font-medium">{t("final_price")}: </span>
                {formData.monthly_price && formData.duration_months
                  ? Number(
                    formData.monthly_price * formData.duration_months -
                    (formData.monthly_price * formData.duration_months * (formData.discount_percent || 0) / 100)
                  ).toLocaleString(undefined, { style: "currency", currency: "BRL" })
                  : "-"}
              </div>
            </div>
          </CardContent>
        </Card>


      </>
    </CustomForm>
  );
}
