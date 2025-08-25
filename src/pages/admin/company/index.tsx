import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCompany, updateCompany, upsertAddress } from "@/lib/supabase/api/admin/company";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/hooks/useSession";
import CustomInput from "@/components/custom/Input/CustomInput";
import CustomSelect from "@/components/custom/Input/CustomSelect";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  IconBuilding,
  IconMail,
  IconMapPin,
  IconCreditCard,
  IconSettings,
} from "@tabler/icons-react";

export default function Page() {
  const { t } = useTranslation("general");
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState<any>({
    name: "",
    legal_name: "",
    identifier: "",
    identifier_type: "",
    email: "",
    phone: "",
    domain: "",
    industry: "",
    status: "",
    slug: "",
    commission_rate: "",
    timezone: "",
    locale: "",
    currency: "",
    bank_name: "",
    bank_account: "",
    bank_agency: "",
    pix_key: "",
  });
  const [formAddress, setFormAddress] = useState<any>({
    address_line: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const { userId } = useSession();
  const toast = useToast();

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const data = await getCompany();
      setCompany(data);
      setForm({
        name: data?.name ?? "",
        legal_name: data?.legal_name ?? "",
        identifier: data?.identifier ?? "",
        identifier_type: data?.identifier_type ?? "",
        email: data?.email ?? "",
        phone: data?.phone ?? "",
        domain: data?.domain ?? "",
        industry: data?.industry ?? "",
        status: data?.status ?? "",
        slug: data?.slug ?? "",
        commission_rate: data?.commission_rate ?? "",
        timezone: data?.timezone ?? "",
        locale: data?.locale ?? "",
        currency: data?.currency ?? "",
        bank_name: data?.bank_name ?? "",
        bank_account: data?.bank_account ?? "",
        bank_agency: data?.bank_agency ?? "",
        pix_key: data?.pix_key ?? "",
      });

      setFormAddress({
        address_line: data?.addresses?.address_line ?? "",
        number: data?.addresses?.number ?? "",
        complement: data?.addresses?.complement ?? "",
        neighborhood: data?.addresses?.neighborhood ?? "",
        city: data?.addresses?.city ?? "",
        state: data?.addresses?.state ?? "",
        postal_code: data?.addresses?.postal_code ?? "",
        country: data?.addresses?.country ?? "",
      });
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleChangeAddress = (name: string, value: string) => {
    setFormAddress({ ...formAddress, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const addressData = await upsertAddress({
        ...formAddress,
        id: company?.addresses?.id,
        user_id: userId as string,
      });

      await updateCompany({
        id: company?.id,
        user_id: userId as string,
        updates: {
          ...form,
          address_id: addressData.id,
        },
      });

      toast({ title: t("success"), description: t("company_updated"), type: "success" });
      fetchCompany();
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cep = formAddress.postal_code?.replace(/\D/g, "");
    if (cep && cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setFormAddress((prev: any) => ({
              ...prev,
              address_line: data.logradouro || prev.address_line || "",
              neighborhood: data.bairro || prev.neighborhood || "",
              city: data.localidade || prev.city || "",
              state: data.uf || prev.state || "",
              complement: data.complemento || prev.complement || "",
            }));
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAddress.postal_code]);

  function getSlugInstruction(slug: string) {
    if (typeof window === "undefined") return "";
    const normalized = (slug || "").replace(/^\/+|\/+$/g, "").replace(/\s+/g, "");
    return `${window.location.origin}/${normalized}`;
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>

        {/* Dados Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <IconBuilding size={20} />
                {t("company_information")}
              </span>
            </CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                name="identifier"
                label={t("identifier")}
                value={form.identifier}
                onChange={(v) => handleChange("identifier", v)}
                disabled={loading}
              />
              <CustomSelect
                name="identifier_type"
                label={t("identifier_type")}
                value={form.identifier_type}
                onChange={(v) => handleChange("identifier_type", v)}
                disabled={loading}
                options={[
                  { value: "CPF", label: "CPF" },
                  { value: "CNPJ", label: "CNPJ" },
                ]}
              />
            </div>
            <CustomInput
              name="industry"
              label={t("industry")}
              value={form.industry}
              onChange={(v) => handleChange("industry", v)}
              disabled={loading}
            />
            <CustomInput
              name="slug"
              label={t("slug")}
              value={form.slug}
              onChange={(v) => handleChange("slug", v)}
              instruction={getSlugInstruction(form.slug)}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <IconMail size={20} />
                {t("contact")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                name="domain"
                label={t("domain")}
                value={form.domain}
                onChange={(v) => handleChange("domain", v)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <IconMapPin size={20} />
                {t("address")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 ">
            <CustomInput
              name="postal_code"
              label={t("address_zip")}
              value={formAddress.postal_code}
              onChange={(v) => handleChangeAddress("postal_code", v)}
              disabled={loading}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomInput
                name="city"
                label={t("address_city")}
                value={formAddress.city}
                onChange={(v) => handleChangeAddress("city", v)}
                disabled={loading}
              />
              <CustomInput
                name="state"
                label={t("address_state")}
                value={formAddress.state}
                onChange={(v) => handleChangeAddress("state", v)}
                disabled={loading}
              />
               <CustomInput
                name="neighborhood"
                label={t("address_neighborhood")}
                value={formAddress.neighborhood}
                onChange={(v) => handleChangeAddress("neighborhood", v)}
                disabled={loading}
              />
            </div>
            <CustomInput
              name="address_line"
              label={t("address_street")}
              value={formAddress.address_line}
              onChange={(v) => handleChangeAddress("address_line", v)}
              disabled={loading}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomInput
                name="number"
                label={t("address_number")}
                value={formAddress.number}
                onChange={(v) => handleChangeAddress("number", v)}
                disabled={loading}
              />
              <CustomInput
                name="complement"
                label={t("address_complement")}
                value={formAddress.complement}
                onChange={(v) => handleChangeAddress("complement", v)}
                disabled={loading}
              />
             
            </div>

          </CardContent>
        </Card>

        {/* Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <IconCreditCard size={20} />
                {t("bank_information")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomInput
                name="bank_name"
                label={t("bank_name")}
                value={form.bank_name}
                onChange={(v) => handleChange("bank_name", v)}
                disabled={loading}
              />
              <CustomInput
                name="bank_account"
                label={t("bank_account")}
                value={form.bank_account}
                onChange={(v) => handleChange("bank_account", v)}
                disabled={loading}
              />
              <CustomInput
                name="bank_agency"
                label={t("bank_agency")}
                value={form.bank_agency}
                onChange={(v) => handleChange("bank_agency", v)}
                disabled={loading}
              />
            </div>
            <CustomInput
              name="pix_key"
              label={t("pix_key")}
              value={form.pix_key}
              onChange={(v) => handleChange("pix_key", v)}
              disabled={loading}
            />
            <CustomInput
              name="stripe_connect_id"
              label={t("stripe_connect_id")}
              value={form.stripe_connect_id}
              onChange={(v) => handleChange("stripe_connect_id", v)}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <IconSettings size={20} />
                {t("settings")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                name="commission_rate"
                label={t("commission_rate")}
                value={form.commission_rate}
                onChange={(v) => handleChange("commission_rate", v)}
                type="number"
                step="0.01"
                disabled={loading}
              />
              <CustomSelect
                name="currency"
                label={t("currency")}
                value={form.currency}
                onChange={(v) => handleChange("currency", v)}
                disabled={loading}
                options={[
                  { value: "BRL", label: "BRL" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomSelect
                name="timezone"
                label={t("timezone")}
                value={form.timezone}
                onChange={(v) => handleChange("timezone", v)}
                disabled={loading}
                options={[
                  { value: "UTC", label: "UTC" },
                ]}
              />
              <CustomSelect
                name="locale"
                label={t("locale")}
                value={form.locale}
                onChange={(v) => handleChange("locale", v)}
                disabled={loading}
                options={[
                  { value: "pt-BR", label: "Português (Brasil)" },
                  { value: "en-US", label: "English (US)" },
                  { value: "es-ES", label: "Español (ES)" },
                ]}
              />
            </div>
            <CustomSelect
              name="status"
              label={t("status")}
              value={form.status}
              onChange={(v) => handleChange("status", v)}
              disabled={true}
              options={[
                { value: "active", label: t("active") },
                { value: "inactive", label: t("inactive") },
                { value: "suspended", label: t("suspended") },
                { value: "pending", label: t("pending") },
              ]}
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
