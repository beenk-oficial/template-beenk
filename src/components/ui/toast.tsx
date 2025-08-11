import * as ToastPrimitive from "@radix-ui/react-toast";
import { useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";

// Adicione estilos globais para animação
import "@/assets/styles/toast-animations.css";

type ToastOptions = {
  title: string;
  description?: string;
  type?: "success" | "error";
};

const ToastContext = createContext<(options: ToastOptions) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({
    title: "",
    description: "",
    type: "success",
  });

  const showToast = useCallback((options: ToastOptions) => {
    setToastOptions({ ...options });
    setOpen(true);
  }, []);

  return (
    <ToastPrimitive.Provider>
      <ToastContext.Provider value={showToast}>
        {children}
        <Toast
          open={open}
          onOpenChange={setOpen}
          title={toastOptions.title}
          description={toastOptions.description}
          type={toastOptions.type}
        />
        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-50" />
      </ToastContext.Provider>
    </ToastPrimitive.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  type = "success",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  type?: "success" | "error";
}) {
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  return (
    open && (
      <ToastPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        forceMount
        className={`toast-root fixed top-4 right-4 z-50 min-w-[280px] rounded-md shadow-lg px-4 py-2 text-white flex items-start gap-3 ${
          type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <span className="mt-0.5">
          <Icon size={22} className="shrink-0" />
        </span>
        <div className="flex-1">
          <ToastPrimitive.Title className="font-bold">{title}</ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="mt-0.5 text-sm">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close className="absolute top-2 right-2 text-white cursor-pointer p-1">
          <X size={16} />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  );
}
