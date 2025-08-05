import { NavLink } from "react-router";
import { Outlet } from "react-router-dom";
import { useWhitelabel } from "@/hooks/useWhitelabel";

export default function AuthLayout() {
  const { name, logo, marketing_banner } = useWhitelabel();

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