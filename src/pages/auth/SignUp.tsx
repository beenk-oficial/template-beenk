import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { GoogleLogo } from "phosphor-react";
import AuthLayout from "@/components/layout/AuthLayout";
import CustomInput from "@/components/custom/Input/CustomInput";
import CustomCheckbox from "@/components/custom/Input/CustomCheckbox";
import CustomMessageBox from "@/components/custom/Input/CustomMessageBox";
import { useFetch } from "@/hooks/useFetch";
import { useWhitelabel } from "@/hooks/useWhitelabel";
import CustomLink from "@/components/custom/CustomLink";
import { normalizeLink } from "@/utils";
import { useNavigate, useParams } from "react-router-dom";

export default function SignUp() {
  const t = useTranslation("signup");
  const generalTranslate = useTranslation("general");
  const whiteLabel = useWhitelabel();
  const customFetch = useFetch();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    name: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email`;

    window.location.href = googleAuthUrl;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formState.password !== formState.confirmPassword) {
      setErrorMessage(t("password_mismatch_error"));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await customFetch("/api/auth/signup", {
        method: "POST",
        body: {
          email: formState.email,
          password: formState.password,
          full_name: formState.name,
        },
      });

      console.log("response", response);

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(
          generalTranslate(errorData.key) || generalTranslate("error_occurred")
        );
        setLoading(false);
        return;
      }
      navigate(normalizeLink("/signin", params));
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(generalTranslate("error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  return (
    <AuthLayout banner={whiteLabel.marketing_banner.signup} invert>
      <form
        className="flex flex-col gap-6 max-w-md w-full justify-center align-center"
        onSubmit={handleEmailSignup}
      >
        <CustomMessageBox message={errorMessage} type="error" />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("signup_title")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("signup_subtitle")}
          </p>
        </div>
        <div className="grid gap-6">
          <CustomInput
            name="name"
            label={t("name_label")}
            type="text"
            value={formState.name}
            onChange={(value) => handleInputChange("name", value)}
            disabled={loading}
            required
          />
          <CustomInput
            name="email"
            label={t("email_label")}
            type="email"
            value={formState.email}
            onChange={(value) => handleInputChange("email", value)}
            disabled={loading}
            required
          />
          <CustomInput
            name="password"
            label={t("password_label")}
            type="password"
            value={formState.password}
            onChange={(value) => handleInputChange("password", value)}
            disabled={loading}
            required
          />
          <CustomInput
            name="confirmPassword"
            label={t("confirm_password_label")}
            type="password"
            value={formState.confirmPassword}
            onChange={(value) => handleInputChange("confirmPassword", value)}
            disabled={loading}
            required
          />
          <CustomCheckbox
            name="agreeTerms"
            value={formState.agreeTerms}
            additionalElement={
              <span className="text-sm">
                {t("agree_terms_and_conditions")}{" "}
                <CustomLink
                  href="/legal/terms"
                  className="underline underline-offset-4"
                >
                  {t("terms_link")}
                </CustomLink>{" "}
                {t("and")}{" "}
                <CustomLink
                  href="/legal/privacy-policy"
                  className="underline underline-offset-4"
                >
                  {t("privacy_policy_link")}
                </CustomLink>
              </span>
            }
            disabled={loading}
            onChange={(checked) => handleInputChange("agreeTerms", checked)}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formState.agreeTerms}
          >
            {loading ? t("signup_button_loading") : t("signup_button")}
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              {t("signup_with")}
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleGoogleSignup}
            disabled={loading}
            type="button"
          >
            <GoogleLogo size={24} weight="bold" />
            {t("continue_with_google")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("login_prompt")}{" "}
          <CustomLink href="/auth/signin" className="underline underline-offset-4">
            {t("login_link")}
          </CustomLink>
        </div>
      </form>
    </AuthLayout>
  );
}
