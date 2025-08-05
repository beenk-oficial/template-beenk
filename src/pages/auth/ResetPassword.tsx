import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useWhitelabel } from "@/hooks/useWhitelabel";
import AuthLayout from "@/components/layout/AuthLayout";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const t = useTranslation("change_password");
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const whiteLabel = useWhitelabel();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/auth/validate_token?token=${token}`);

        if (response.ok) {
          setTokenValid(true);
        } else {
          navigate("/auth/password_reset");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        navigate("/auth/password_reset");
      }
    };

    validateToken();
  }, [token, token]);

  useEffect(() => {
    if (!tokenValid) {
      navigate("/error/403");
    }
  }, [tokenValid, token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Reset password error:", errorData.error);
        setLoading(false);
        return;
      }

      console.log("Password reset successfully");
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
    <AuthLayout banner={whiteLabel.marketing_banner.signup} invert>
      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">{t("password_label")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirm-password">
            {t("confirm_password_label")}
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("button_loading") : t("button")}
        </Button>
      </form>
    </AuthLayout>
  );
}
