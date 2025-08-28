import React, { useState, useEffect } from "react";
import { getCompany } from "@/lib/supabase/api/admin/company";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomInputColorPicker from "@/components/custom/Input/CustomInputColorPicker";
import CustomInputImage from "@/components/custom/Input/CustomInputImage";
import { getImageUrl, updateImage } from "@/lib/supabase/api/admin/image";
import { createWhiteLabel, updateWhiteLabel } from "@/lib/supabase/api/whitelabel";
import { updateCompany } from "@/lib/supabase/api/admin/company";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import tinycolor from "tinycolor2";

const Page = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");

  const [form, setForm] = useState({
    colors: "",
    logo_path: "",
    favicon_path: "",
    banner_login_path: "",
    banner_signup_path: "",
    banner_change_password_path: "",
    banner_request_password_reset_path: "",
  });

  const [formFiles, setFormFiles] = useState({
    logo: null as File | string | null,
    favicon: null as File | string | null,
    banner_login: null as File | string | null,
    banner_signup: null as File | string | null,
    banner_change_password: null as File | string | null,
    banner_request_password_reset: null as File | string | null,
  });

  const { userId } = useSession();
  const toast = useToast();
  const { t } = useTranslation("general");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const company = await getCompany();
    console.log("Fetched company:", company);
    if (company) {
      console.log("Company data:", company);
      setCompany(company);
      const whitelabel = company.whitelabel || {};
      let parsedColors: any = {};
      parsedColors = whitelabel.colors ? JSON.parse(whitelabel.colors) : {};

      setPrimaryColor(parsedColors.primary || "#000000");
      setSecondaryColor(parsedColors.secondary || "#ffffff");
      setForm({
        colors: whitelabel.colors || "",
        logo_path: whitelabel.logo_path || "",
        favicon_path: whitelabel.favicon_path || "",
        banner_login_path: whitelabel.banner_login_path || "",
        banner_signup_path: whitelabel.banner_signup_path || "",
        banner_change_password_path: whitelabel.banner_change_password_path || "",
        banner_request_password_reset_path: whitelabel.banner_request_password_reset_path || "",
      });

      setFormFiles({
        logo: whitelabel.logo_path ? await getImageUrl("admin", whitelabel.logo_path || "") : null,
        favicon: whitelabel.favicon_path ? await getImageUrl("admin", whitelabel.favicon_path || "") : null,
        banner_login: whitelabel.banner_login_path ? await getImageUrl("admin", whitelabel.banner_login_path || "") : null,
        banner_signup: whitelabel.banner_signup_path ? await getImageUrl("admin", whitelabel.banner_signup_path || "") : null,
        banner_change_password: whitelabel.banner_change_password_path ? await getImageUrl("admin", whitelabel.banner_change_password_path || "") : null,
        banner_request_password_reset: whitelabel.banner_request_password_reset_path ? await getImageUrl("admin", whitelabel.banner_request_password_reset_path || "") : null,
      })
    }

    setLoading(false);
  }

  const handleImageChange = (name: string, value: File[]) => {
    console.log("Selected files for", name, value, company);
    setFormFiles((prev) => ({ ...prev, [name]: value[0] || null }));
    setForm((prev) => ({
      ...prev,
      [name]: value ? `${company.id}/${name}` : null,
    }));
  };

  async function handleUpdateImage(key: string) {
    const file = formFiles[key as keyof typeof formFiles] as File | string | null;
    if (!file || !company?.id || !(file instanceof File)) return;
    const logoPath = `${company.id}/${key}`;
    const { data, error } = await updateImage(
      file,
      "admin",
      logoPath
    );
    if (error) throw error;
    return data?.path;
  }

  function generateColors(primary: string, secondary: string) {
    const p = tinycolor(primary);
    const s = tinycolor(secondary);

    return {
      background: p.darken(40).toHexString(),
      foreground: p.isLight() ? "#111" : "#fff",
      radius: "6px",

      card: p.darken(30).toHexString(),
      "card-foreground": p.isLight() ? "#111" : "#fff",

      popover: p.lighten(20).toHexString(),
      "popover-foreground": p.isLight() ? "#111" : "#fff",

      primary,
      "primary-foreground": p.isLight() ? "#111" : "#fff",

      secondary,
      "secondary-foreground": s.isLight() ? "#111" : "#fff",

      muted: p.desaturate(30).toHexString(),
      "muted-foreground": "#aaa",

      accent: s.lighten(10).toHexString(),
      "accent-foreground": s.isLight() ? "#111" : "#fff",

      destructive: "#DC3545",

      border: p.darken(20).toHexString(),
      input: p.darken(25).toHexString(),
      ring: primary,

      chart1: p.spin(20).toHexString(),
      chart2: p.spin(-20).toHexString(),
      chart3: s.spin(40).toHexString(),
      chart4: s.spin(-40).toHexString(),
      chart5: p.lighten(25).toHexString(),

      sidebar: s.darken(40).toHexString(),
      "sidebar-foreground": s.isLight() ? "#111" : "#fff",
      "sidebar-primary": p.lighten(10).toHexString(),
      "sidebar-primary-foreground": s.isLight() ? "#111" : "#fff",
      "sidebar-accent": s.lighten(15).toHexString(),
      "sidebar-accent-foreground": s.isLight() ? "#111" : "#fff",
      "sidebar-border": s.darken(25).toHexString(),
      "sidebar-ring": p.lighten(35).toHexString(),
    };
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleUpdateImage("logo");
      await handleUpdateImage("favicon");
      await handleUpdateImage("banner_login");
      await handleUpdateImage("banner_signup");
      await handleUpdateImage("banner_change_password");
      await handleUpdateImage("banner_request_password_reset");

      const colorsObj = generateColors(primaryColor, secondaryColor);

      const whitelabelPayload = {
        ...form,
        colors: colorsObj,
        logo_path: form.logo_path,
        favicon_path: form.favicon_path,
        banner_login_path: form.banner_login_path,
        banner_signup_path: form.banner_signup_path,
        banner_change_password_path: form.banner_change_password_path,
        banner_request_password_reset_path: form.banner_request_password_reset_path,
      };

      let whitelabelId = company?.whitelabel?.id;

      if (whitelabelId) {
        await updateWhiteLabel({
          id: whitelabelId,
          updates: whitelabelPayload,
          user_id: userId,
        });
      } else {
        const { whitelabel } = await createWhiteLabel({
          whitelabel: whitelabelPayload,
          user_id: userId,
        });
        whitelabelId = whitelabel.id;
        await updateCompany({
          id: company.id,
          user_id: userId as string,
          updates: { white_label_id: whitelabelId },
        });
      }

      toast({ title: t("success"), description: t("whitelabel_saved"), type: "success" });
    } catch (err) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl  w-full">
      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Logo e Favicon</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <CustomInputImage
              label="Logo"
              description="SVG ou PNG (máx. 2MB)"
              multiple={false}
              allowedFormats={["svg", "png"]}
              onChange={(v) => handleImageChange("logo", v)}
              value={formFiles.logo}
              className="h-40"
            />
            <CustomInputImage
              label="Favicon"
              description="SVG ou PNG (máx. 2MB, 32x32px ou 64x64px)"
              multiple={false}
              allowedFormats={["svg", "png"]}
              onChange={(v) => handleImageChange("favicon", v)}
              value={formFiles.favicon}
              className="h-40"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row">
            <CustomInputColorPicker
              label="Principal"
              value={primaryColor}
              onChange={setPrimaryColor}
              name="primary"
            />
            <CustomInputColorPicker
              label="Secundária "
              value={secondaryColor}
              onChange={setSecondaryColor}
              name="secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banners de Marketing</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <CustomInputImage
              label="Login"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(v) => handleImageChange("banner_login", v)}
              value={formFiles.banner_login}
              className="h-80"
            />
            <CustomInputImage
              label="Signup"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(v) => handleImageChange("banner_signup", v)}
              value={formFiles.banner_signup}
              className="h-80"
            />
            <CustomInputImage
              label="Troca de Senha"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(v) => handleImageChange("banner_change_password", v)}
              value={formFiles.banner_change_password}
              className="h-80"
            />
            <CustomInputImage
              label="Recuperar Senha"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(v) => handleImageChange("banner_request_password_reset", v)}
              value={formFiles.banner_request_password_reset}
              className="h-80"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {"Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Page;
