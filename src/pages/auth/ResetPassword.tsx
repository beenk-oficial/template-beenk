import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { changePassword, validatePasswordResetToken } from "@/lib/supabase/api/auth";
import CustomInput from "@/components/custom/Input/CustomInput";

export default function ResetPassword() {
  const { t } = useTranslation("change_password");
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  useEffect(() => {
    if (!tokenValid) {
      navigate("/error/403");
    }
  }, [tokenValid, token]);

  const validateToken = async () => {
    if (!token) return;

    try {
      const response = await validatePasswordResetToken({ token });

      !(response as { error?: string })?.error ? (
        setTokenValid(true)
      ) : (
        navigate("/error/403")
      );

    } catch (error) {
      navigate("/error/403");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword({
        token: token!,
        new_password: password,
      })

      if ((response as { error?: string })?.error) {
        setLoading(false);
        return;
      }

      navigate("/signin");
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return null;
  }

  return (
    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("subtitle")}
        </p>
      </div>

      <CustomInput
        name="password"
        label={t("password_label")}
        type="password"
        value={password}
        onChange={setPassword}
        required
      />

      <CustomInput
        name="confirmPassword"
        label={t("confirm_password_label")}
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("button_loading") : t("button")}
      </Button>
    </form>
  );
}
