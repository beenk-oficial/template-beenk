import React, { useState, useEffect, useId } from "react";
import { getCompany } from "@/lib/supabase/api/admin/company";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomInputColorPicker from "@/components/custom/Input/CustomInputColorPicker";
import CustomInputImage from "@/components/custom/Input/CustomInputImage";
import { deleteImages, getImageUrl, updateImage } from "@/lib/supabase/api/admin/image";
import { createWhiteLabel, updateWhiteLabel } from "@/lib/supabase/api/whitelabel";
import { updateCompany } from "@/lib/supabase/api/admin/company";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import tinycolor from "tinycolor2";
import { askChatGPT } from "@/lib/supabase/api/ia";

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
      parsedColors = whitelabel.colors;

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
    setFormFiles((prev) => ({ ...prev, [name]: value?.[0] || null }));
  };

  async function handleUpdateImage(key: string, oldPath: string | null) {
    if (!formFiles[key as keyof typeof formFiles] && oldPath) {
      await deleteImages('admin', [oldPath]);
      return null;
    }

    const file = formFiles[key as keyof typeof formFiles] as File | string | null;
    if (!file || !company?.id || !(file instanceof File)) return;
    const currentPath = `${company.id}/${key}-${crypto.randomUUID()}`;

    const { data, error } = await updateImage(
      file,
      "admin",
      currentPath,
      { oldPath }
    );

    if (error) throw error;

    return data?.path ?? null;
  }
  async function generateColors(primary: string, secondary: string) {
    const p = tinycolor(primary);    // NÃO ALTERAMOS
    const s = tinycolor(secondary);  // NÃO ALTERAMOS

    // ---------- Helpers ----------
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const toHsl = (c: tinycolor.Instance) => c.toHsl();

    function tweak(c: tinycolor.Instance, { s = 0, l = 0, h = 0 }: { s?: number; l?: number; h?: number }) {
      const hsl = toHsl(c);
      return tinycolor({ h: (hsl.h + h + 360) % 360, s: clamp(hsl.s + s, 0, 1), l: clamp(hsl.l + l, 0, 1) });
    }

    function ensureReadable(bg: tinycolor.Instance) {
      const white = tinycolor("#ffffff");
      const black = tinycolor("#111111");
      if (tinycolor.readability(bg, white) >= 4.5) return "#fff";
      if (tinycolor.readability(bg, black) >= 4.5) return "#111";

      // Ajuste mínimo no candidato mais promissor para atingir 4.5 (sem mexer no bg)
      let candidate = tinycolor.readability(bg, white) > tinycolor.readability(bg, black) ? white : black;
      for (let i = 0; i < 8 && tinycolor.readability(bg, candidate) < 4.5; i++) {
        const hsl = candidate.toHsl();
        const delta = candidate === white ? +0.03 : -0.03;
        candidate = tinycolor({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + delta, 0, 1) });
      }
      return candidate.toHexString();
    }

    // ---------- Base neutra moderna ----------
    // Mistura p + s + cinza só para o BACKGROUND neutro (não altera p/s)
    const neutralMix = tinycolor.mix(tinycolor.mix(p, s, 50), "#808080", 35);
    const background = tinycolor({ ...neutralMix.toHsl(), s: 0.10, l: 0.12 }); // dark elegante

    // Hierarquia de superfícies (steps coerentes)
    const card = tweak(background, { l: +0.06 });
    const popover = tweak(background, { l: +0.09 });
    const input = tweak(background, { l: +0.04 });
    const border = tweak(background, { l: +0.16 });
    const ring = p.clone().lighten(20);

    // Sidebar discreta, derivada da secondary (sem mudar secondary em si)
    const sidebar = tweak(s, { l: -0.20, s: -0.10 });
    const sidebarPrimary = p.clone().lighten(18);
    const sidebarAccent = s.clone().saturate(15).lighten(8);

    // Accents e muted
    const accent = s.clone().saturate(20).lighten(8);
    const muted = tweak(background, { l: +0.02, s: -0.05 });

    // Charts: variações harmônicas (derivadas, sem tocar p/s originais)
    const chart1 = p.clone().spin(10).saturate(5).lighten(10);
    const chart2 = s.clone().spin(-10).saturate(5).lighten(10);
    const chart3 = accent.clone().spin(30).lighten(6);
    const chart4 = accent.clone().spin(-30).darken(4);
    const chart5 = background.clone().lighten(22);

    return {
      // Fundo e superfícies
      background: background.toHexString(),
      foreground: ensureReadable(background),
      radius: "8px",

      card: card.toHexString(),
      "card-foreground": ensureReadable(card),

      popover: popover.toHexString(),
      "popover-foreground": ensureReadable(popover),

      // MARCAS (mantidas exatamente como recebidas)
      primary: p.toHexString(),
      "primary-foreground": ensureReadable(p),

      secondary: s.toHexString(),
      "secondary-foreground": ensureReadable(s),

      // Estado/accents
      muted: muted.toHexString(),
      "muted-foreground": ensureReadable(muted),

      accent: accent.toHexString(),
      "accent-foreground": ensureReadable(accent),

      destructive: "#DC3545",

      // Contornos/inputs/anéis
      border: border.toHexString(),
      input: input.toHexString(),
      ring: ring.toHexString(),

      // Charts
      chart1: chart1.toHexString(),
      chart2: chart2.toHexString(),
      chart3: chart3.toHexString(),
      chart4: chart4.toHexString(),
      chart5: chart5.toHexString(),

      // Sidebar
      sidebar: sidebar.toHexString(),
      "sidebar-foreground": ensureReadable(sidebar),

      "sidebar-primary": sidebarPrimary.toHexString(),
      "sidebar-primary-foreground": ensureReadable(sidebarPrimary),

      "sidebar-accent": sidebarAccent.toHexString(),
      "sidebar-accent-foreground": ensureReadable(sidebarAccent),

      "sidebar-border": tweak(border, { l: +0.02 }).toHexString(),
      "sidebar-ring": p.clone().lighten(28).toHexString(),
    };
  }


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      form.logo_path = await handleUpdateImage("logo", form.logo_path) as string;
      form.favicon_path = await handleUpdateImage("favicon", form.favicon_path) as string;
      form.banner_login_path = await handleUpdateImage("banner_login", form.banner_login_path) as string;
      form.banner_signup_path = await handleUpdateImage("banner_signup", form.banner_signup_path) as string;
      form.banner_change_password_path = await handleUpdateImage("banner_change_password", form.banner_change_password_path) as string;
      form.banner_request_password_reset_path = await handleUpdateImage("banner_request_password_reset", form.banner_request_password_reset_path) as string;
      form.colors = await generateColors(primaryColor, secondaryColor);


      let whitelabelId = company?.whitelabel?.id;

      if (whitelabelId) {
        await updateWhiteLabel({
          id: whitelabelId,
          updates: form,
          user_id: userId,
        });
      } else {
        const { whitelabel } = await createWhiteLabel({
          whitelabel: form,
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
      console.log("Error saving whitelabel:", err);
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
            <CardTitle>{t("logo")} & {t("favicon")}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <CustomInputImage
              label={t("logo")}
              description={t("desc_logo")}
              multiple={false}
              allowedFormats={["svg", "png"]}
              onChange={(v) => handleImageChange("logo", v)}
              value={formFiles.logo}
              className="h-40"
            />
            <CustomInputImage
              label={t("favicon")}
              description={t("desc_favicon")}
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
            <CardTitle>{t("colors")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row">
            <CustomInputColorPicker
              label={t("primary_color")}
              value={primaryColor}
              onChange={setPrimaryColor}
              name="primary"
            />
            <CustomInputColorPicker
              label={t("secondary_color")}
              value={secondaryColor}
              onChange={setSecondaryColor}
              name="secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("marketing_banners")}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <CustomInputImage
              label={t("login_banner")}
              description={t("desc_banner")}
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              maxSizeMB={50}
              onChange={(v) => handleImageChange("banner_login", v)}
              value={formFiles.banner_login}
              className="h-80"
            />
            <CustomInputImage
              label={t("signup_banner")}
              description={t("desc_banner")}
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              maxSizeMB={50}
              onChange={(v) => handleImageChange("banner_signup", v)}
              value={formFiles.banner_signup}
              className="h-80"
            />
            <CustomInputImage
              label={t("change_password_banner")}
              description={t("desc_banner")}
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              maxSizeMB={50}
              onChange={(v) => handleImageChange("banner_change_password", v)}
              value={formFiles.banner_change_password}
              className="h-80"
            />
            <CustomInputImage
              label={t("request_password_reset_banner")}
              description={t("desc_banner")}
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              maxSizeMB={50}
              onChange={(v) => handleImageChange("banner_request_password_reset", v)}
              value={formFiles.banner_request_password_reset}
              className="h-80"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Page;
