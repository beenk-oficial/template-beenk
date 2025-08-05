import { ReactNode } from "react";

export default function ErrorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full text-center p-6 bg-white shadow-md rounded-md">
        {children}
      </div>
    </div>
  );
}
