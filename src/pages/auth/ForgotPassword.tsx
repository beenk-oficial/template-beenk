import { useState } from "react";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import CustomInput from "@/components/custom/Input/CustomInput";
import CustomMessageBox from "@/components/custom/Input/CustomMessageBox";
import { Button } from "@/components/ui/button";
import CustomLink from "@/components/custom/CustomLink";
import { useFetch } from "@/hooks/useFetch";

export default function ForgotPassword() {
  const t = useTranslation("request_password_reset");
  const generalTranslate = useTranslation("general");
  const customFetch = useFetch();

  const [formState, setFormState] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await customFetch("/api/auth/request_password_reset", {
        method: "POST",
        body: { email: formState.email },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({
          text:
            generalTranslate(errorData.key) ||
            generalTranslate("error_occurred"),
          type: "error",
        });
        setLoading(false);
        return;
      }

      setMessage({ text: t("password_reset_email_sent"), type: "success" });
      setSuccess(true);
    } catch (error) {
      setMessage({ text: generalTranslate("error_occurred"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6 max-w-md w-full justify-center align-center">
        <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
          <CustomMessageBox
            message={message?.text}
            type={message?.type || "error"}
          />

          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground text-sm text-balance">
              {t("subtitle")}
            </p>
          </div>
          <CustomInput
            name="email"
            label={t("email_label")}
            type="email"
            value={formState.email}
            onChange={(value) => handleInputChange("email", value)}
            disabled={loading || success}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading || success}
          >
            {loading ? t("button_loading") : t("button")}
          </Button>
        </form>
        <div className="text-center text-sm mt-4">
          <CustomLink href="/auth/signin" className="underline underline-offset-4">
            {t("back_to_login")}
          </CustomLink>
        </div>
      </div>
    </AuthLayout>
  );
}
