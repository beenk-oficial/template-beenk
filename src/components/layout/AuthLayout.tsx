import { NavLink, useNavigate, useParams } from "react-router";
import { Outlet } from "react-router-dom";
import { useWhitelabel } from "@/hooks/useWhitelabel";
import { Spinner } from "../custom/Spinner";
import { useEffect, useState } from "react";
import { refreshToken } from "@/lib/supabase/api/auth";
import { UserType, type User } from "@/types";
import { useUserStore } from "@/stores/user";
import { normalizeLink } from "@/utils";

export default function AuthLayout() {
  const { name, logo, marketing_banner } = useWhitelabel();
  const [loading, setLoading] = useState(true);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    setLoading(true);

    const checkUser = async () => {
      try {
        const response = await refreshToken();
        setUser(response.user as unknown as User);
        redirectUserByType(response.user.type);
        setLoading(false);
      } catch {
        console.error("Error refreshing token");
      }
    };

    checkUser();
  }, [location.pathname]);

    const redirectUserByType = (userType: string) => {
      if (userType === UserType.ADMIN) {
        navigate(normalizeLink("/admin/dashboard", params));
      } else if (userType === UserType.USER) {
        navigate(normalizeLink("/app/dashboard", params));
      } else if (userType === UserType.OWNER) {
        navigate("/owner");
      }
    };

  const FormColumn = (
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <NavLink to="/" className="flex items-center cursor-pointer">
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-full h-10 object-contain"
        />
      </NavLink>
      <div className="flex justify-center align-center h-full -mt-10">
        <Outlet />
      </div>
    </div>
  );

  const BannerColumn = (
    <div className="bg-muted relative hidden lg:block">
      <img
        src={marketing_banner.login}
        alt="Image"
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background/20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="grid min-h-svh lg:grid-cols-2">
        {false ? (
          <>
            {BannerColumn}
            {FormColumn}
          </>
        ) : (
          <>
            {FormColumn}
            {BannerColumn}
          </>
        )}
      </div>
    </div>
  );
}