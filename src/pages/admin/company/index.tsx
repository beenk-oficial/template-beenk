import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCompany, updateCompany } from "@/lib/supabase/api/admin/company";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/hooks/useSession";
import CustomInput from "@/components/custom/Input/CustomInput";
import CustomSelect from "@/components/custom/Input/CustomSelect";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  const { t } = useTranslation("general");
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { userId } = useSession();
  const toast = useToast();

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const data = await getCompany();
      setCompany(data);
      setForm({
        name: data?.name || "",
        legal_name: data?.legal_name || "",
        identifier: data?.identifier || "",
        identifier_type: data?.identifier_type || "",
        email: data?.email || "",
        phone: data?.phone || "",
        domain: data?.domain || "",
        industry: data?.industry || "",
        status: data?.status || "",
        // ...adicione outros campos relevantes aqui
      });
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line
  }, []);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateCompany({
        id: company?.id,
        user_id: userId as string,
        updates: form,
      });
      toast({ title: t("success"), description: t("company_updated"), type: "success" });
      fetchCompany();
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!company) {
    return <div className="py-8 text-center">{t("loading")}...</div>;
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8 mx-auto">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("company_information")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CustomInput
              name="name"
              label={t("name")}
              value={form.name}
              onChange={(v) => handleChange("name", v)}
              required
              disabled={loading}
            />
            <CustomInput
              name="legal_name"
              label={t("legal_name")}
              value={form.legal_name}
              onChange={(v) => handleChange("legal_name", v)}
              disabled={loading}
            />
            <CustomInput
              name="identifier"
              label={t("identifier")}
              value={form.identifier}
              onChange={(v) => handleChange("identifier", v)}
              disabled={loading}
            />
            <CustomInput
              name="identifier_type"
              label={t("identifier_type")}
              value={form.identifier_type}
              onChange={(v) => handleChange("identifier_type", v)}
              disabled={loading}
            />
            <CustomInput
              name="industry"
              label={t("industry")}
              value={form.industry}
              onChange={(v) => handleChange("industry", v)}
              disabled={loading}
            />
            <CustomSelect
              name="status"
              label={t("status")}
              value={form.status}
              onChange={(v) => handleChange("status", v)}
              disabled={loading}
              options={[
                { value: "active", label: t("active") },
                { value: "inactive", label: t("inactive") },
                { value: "suspended", label: t("suspended") },
                { value: "pending", label: t("pending") },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("contact")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CustomInput
              name="email"
              label={t("email")}
              value={form.email}
              onChange={(v) => handleChange("email", v)}
              type="email"
              disabled={loading}
            />
            <CustomInput
              name="phone"
              label={t("phone")}
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
              disabled={loading}
            />
            <CustomInput
              name="domain"
              label={t("domain")}
              value={form.domain}
              onChange={(v) => handleChange("domain", v)}
              disabled={loading}
            />
          </CardContent>
        </Card>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? t("saving") + "..." : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
