import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CustomDialogProps {
  open: boolean;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
}

export const CustomDialog = ({
  open,
  children,
  onOpenChange,
}: CustomDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay />
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmDeleteDialog = ({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteDialogProps) => {
  const t = useTranslation("general");
  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title ?? t("confirm_deletion")}</DialogTitle>
        <DialogDescription>
          {description ?? t("confirm_deletion_description")}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          onClick={() => onOpenChange(false)}
          type="button"
          variant={"outline"}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          type="button"
          variant={"destructive"}
        >
          <Trash2 className=" h-4 w-4" />
          {t("delete")}
        </Button>
      </DialogFooter>
    </CustomDialog>
  );
};
