import React, { useState } from "react";
import { useWhitelabelStore } from "@/stores/whitelabel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/custom/Input/CustomInput";
import CustomInputColorPicker from "@/components/custom/Input/CustomInputColorPicker";
import CustomInputImage from "@/components/custom/Input/CustomInputImage";
import { updateImage } from "@/lib/supabase/api/admin/image"; // importação adicionada

const Page = () => {
  const {
    colors,
    logo,
    favicon,
    marketing_banner,
    id, // id do whitelabel
  } = useWhitelabelStore();

  // Extrai as cores primária e secundária do JSON, se existirem
  let parsedColors: any = {};
  try {
    parsedColors = JSON.parse(colors ? JSON.stringify(colors) : "{}");
  } catch {
    parsedColors = {};
  }
  const [primaryColor, setPrimaryColor] = useState(parsedColors.primary || "#000000");
  const [secondaryColor, setSecondaryColor] = useState(parsedColors.secondary || "#ffffff");

  const [form, setForm] = useState({
    colors: JSON.stringify(colors || {}, null, 2),
    logo: logo || "",
    favicon: favicon || "",
    marketing_banner_login: marketing_banner?.login || "",
    marketing_banner_signup: marketing_banner?.signup || "",
    marketing_banner_change_password: marketing_banner?.change_password || "",
    marketing_banner_request_password_reset: marketing_banner?.request_password_reset || "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const normalizedColors = {
      primary: primaryColor,
      secondary: secondaryColor,
    };
    setForm((prev) => ({
      ...prev,
      colors: JSON.stringify(normalizedColors, null, 2),
    }));
  }, [primaryColor, secondaryColor]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoImageChange = (files: File[]) => {
    setLogoFile(files[0] || null);
    setForm((prev) => ({
      ...prev,
      logo: files[0] ? "" : prev.logo,
    }));
  };

  const handleFaviconImageChange = (files: File[]) => {
    setFaviconFile(files[0] || null);
    setForm((prev) => ({
      ...prev,
      favicon: files[0] ? "" : prev.favicon,
    }));
  };


  async function handleUpdateImage(file: File, key: string) {
    const logoPath = `${id}/${key}`;
    const { data, error } = await updateImage(
      file,
      "admin",
      logoPath
    );

    if (error) throw error;

    return data?.path
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const logoUrl = await handleUpdateImage(logoFile, `${id}/logo`);
      const faviconUrl = await handleUpdateImage(faviconFile, `${id}/favicon`);

      alert("Whitelabel salvo!");
    } catch (err) {
      alert("Erro ao salvar. Verifique o JSON das cores.");
    } finally {
      setSaving(false);
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
              onChange={handleLogoImageChange}
              className="h-40"
            />
            <CustomInputImage
              label="Favicon"
              description="SVG ou PNG (máx. 2MB, 32x32px ou 64x64px)"
              multiple={false}
              allowedFormats={["svg", "png"]}
              onChange={handleFaviconImageChange}
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
              onChange={(files) =>
                handleChange("marketing_banner_login", files[0] ? files[0].name : "")
              }
              className="h-80"
            />
            <CustomInputImage
              label="Signup"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(files) =>
                handleChange("marketing_banner_signup", files[0] ? files[0].name : "")
              }
              className="h-80"
            />
            <CustomInputImage
              label="Troca de Senha"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(files) =>
                handleChange("marketing_banner_change_password", files[0] ? files[0].name : "")
              }
              className="h-80"
            />
            <CustomInputImage
              label="Recuperar Senha"
              description="PNG ou JPG (máx. 2MB, recomendado 600x200px)"
              multiple={false}
              allowedFormats={["png", "jpg", "jpeg"]}
              onChange={(files) =>
                handleChange("marketing_banner_request_password_reset", files[0] ? files[0].name : "")
              }
              className="h-80"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Page;
