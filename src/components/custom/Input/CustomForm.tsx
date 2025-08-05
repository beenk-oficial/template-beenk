import * as React from "react";
import { useIsMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";

interface CustomFormProps {
  open: boolean;
  title: string;
  description?: string;

  children: React.ReactNode;
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export default function CustomForm({
  open,
  title,
  description,
  children,
  footer,
  onOpenChange,
  onSubmit,
}: CustomFormProps) {
  const isMobile = useIsMobile();
  const t = useTranslation("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {children}
          </form>
        </div>
        <DrawerFooter>
          {footer || (
            <>
              <Button type="submit" onClick={handleSubmit}>
                {t("save")}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">{t("cancel")}</Button>
              </DrawerClose>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
