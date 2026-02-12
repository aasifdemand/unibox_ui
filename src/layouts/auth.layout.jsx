import Logo from "../components/shared/logo";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-gray-50 to-blue-50">
      {/* Logo with icon */}
      <Logo />

      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>© 2024 Unibox Inc. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
