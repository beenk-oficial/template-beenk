import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { GoogleLogo } from "phosphor-react";
import { useUserStore } from "@/stores/user";
import { type User, UserType } from "@/types";
import CustomLink from "@/components/custom/CustomLink";
import { getCookieValue, normalizeLink, setCookie } from "@/utils";
import CustomInput from "@/components/custom/Input/CustomInput";
import CustomCheckbox from "@/components/custom/Input/CustomCheckbox";
import CustomMessageBox from "@/components/custom/Input/CustomMessageBox";
import { useNavigate, useParams } from "react-router-dom";
import { signinWithEmail, signinWithGoogle } from "@/lib/supabase/api/auth";
import { useWhitelabelStore } from "@/stores/whitelabel";


export default function SignIn() {
  const { t } = useTranslation("login");
  const { t: generalTranslate } = useTranslation("general");
  const navigate = useNavigate();
  const params = useParams();

  const setUser = useUserStore((state) => state.setUser);
  const companyStore = useWhitelabelStore((state) => state.company);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = getCookieValue("userEmail");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleGoogleLogin = async () => {
    const clientId = import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID!;
    const redirectUri = import.meta.env.VITE_PUBLIC_GOOGLE_REDIRECT_URI!;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email`;

    window.location.href = googleAuthUrl;
  };

  const redirectUserByType = (userType: string) => {
    if (userType === UserType.ADMIN) {
      navigate(normalizeLink("/admin/dashboard", params));
    } else if (userType === UserType.USER) {
      navigate(normalizeLink("/app/dashboard", params));
    } else if (userType === UserType.OWNER) {
      navigate("/owner");
    }
  };

  const authenticateWithGoogle = async (
    code: string,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setUser: (user: User) => void
  ) => {
    setLoading(true);

    try {
      const response =  await signinWithGoogle({
        code,
        company_id: companyStore?.id || "",
      })

      if (response?.error) {
        const { error } = response as unknown as { error: { key: string } };
        setErrorMessage(
          generalTranslate(error.key) || generalTranslate("error_occurred")
        );
        setLoading(false);
        return;
      }

      const { user, token } = response;
      setUser(user as User);

      setCookie("accessToken", token?.access_token || "", 3600);
      setCookie("refreshToken", token?.refresh_token || "", 604800);

      redirectUserByType(user?.type);
    } catch (error) {
      setErrorMessage(generalTranslate("error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      authenticateWithGoogle(code, setLoading, setUser);
    }
  }, [params]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await signinWithEmail({
        email,
        password,
        company_id: companyStore?.id || "",
      });

      console.log("response", response)

      if (response?.error) {
        const { error } = response as unknown as { error: { key: string } };
        console.log("error", error)
        setErrorMessage(
          generalTranslate(error.key) || generalTranslate("error_occurred")
        );
        setLoading(false);
        return;
      }

      const { user, token } = response;
      setUser(user as unknown as User);

      setCookie("accessToken", token?.access_token || "", 3600);
      setCookie("refreshToken", token?.refresh_token || "", 604800);
      setCookie("userEmail", email, rememberMe ? 604800 : 0);

      redirectUserByType(user?.type);
    } catch (error) {
      console.log("catch", error)
      setErrorMessage(generalTranslate("error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 max-w-md w-full justify-center align-center"
      onSubmit={handleEmailLogin}
    >
      <CustomMessageBox message={errorMessage} type="error" />

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("login_title")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("login_subtitle")}
        </p>
      </div>
      <div className="grid gap-6">
        <CustomInput
          name="email"
          label={t("email_label")}
          type="email"
          value={email}
          onChange={setEmail}
          disabled={loading}
          required
        />
        <CustomInput
          label={t("password_label")}
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          disabled={loading}
          additionalElement={
            <CustomLink
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("forgot_password")}
            </CustomLink>
          }
          required
        />
        <CustomCheckbox
          name="rememberMe"
          value={rememberMe}
          label={t("remember_me")}
          disabled={loading}
          onChange={(checked) => setRememberMe(checked as boolean)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? generalTranslate("loading") : t("login_button")}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {t("login_with")}
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 hover:bg-red-400"
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
        >
          <GoogleLogo size={24} weight="bold" />
          {t("continue_with_google")}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t("signup_prompt")}{" "}
        <CustomLink href="/auth/signup" className="underline underline-offset-4">
          {t("signup_link")}
        </CustomLink>
      </div>
    </form>
  );
}
