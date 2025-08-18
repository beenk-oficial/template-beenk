import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, SortOrder } from "@/types";
import { useTranslation } from "react-i18next";
import { formatToLocaleDate } from "@/utils";
import {
  deletePromoCodes,
  getPromoCodesPaginated,
  updatePromoCode,
  createPromoCode
} from "@/lib/supabase/api/admin/promo-codes";
import { useToast } from "@/components/ui/toast";
import { ConfirmDeleteDialog } from "@/components/custom/Dialog/CustomDialog";
import Form from "./form";
import { useSession } from "@/hooks/useSession";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const { t } = useTranslation("general");
  const [data, setData] = useState<any[]>([]);

  const [pagination, setPagination] = useState<IPagination>({
    sortField: "created_at",
    sortOrder: SortOrder.ASC,
    currentPage: 1,
    itemsPerPage: 10,
    currentTotalItems: 0,
    totalItems: 0,
    totalPages: 0,
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<any | null>(null);
  const { userId } = useSession();

  const toast = useToast();

  const columns = [
    {
      label: t("code"),
      field: "code",
      sortable: true,
      component: ({ row }: { row: any }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.code}
        </Badge>
      ),
    },
    {
      label: t("description"),
      field: "description",
    },
    {
      label: t("discount_type"),
      field: "discount_type",
      format: (value: string) => t(value),
    },
    {
      label: t("discount_value"),
      field: "discount_value",
      component: ({ row }: { row: any }) => {
        if (row.discount_type === "percentage") {
          return <span>{Number(row.discount_value).toFixed(2)}%</span>;
        }
        return (
          <span>
            {Number(row.discount_value).toLocaleString(undefined, {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      label: t("usage_limit"),
      field: "usage_limit",
    },
    {
      label: t("total_usage_limit"),
      field: "total_usage_limit",
    },
    {
      label: t("expires_at"),
      field: "expires_at",
      format: formatToLocaleDate,
    },
    {
      label: t("created_at"),
      field: "created_at",
      sortable: true,
      format: formatToLocaleDate,
    },
  ];

  const actions = {
    update: (updatedData: any) => {
      setEditingPromoCode(updatedData);
      setOpen(true);
    },
    delete: (row: Record<string, any>) => {
      setDeleteDialogOpen(true);
      setToDelete([row.id]);
    },
  };

  const fetchData = async (updatedPagination: IPagination | null = null) => {
    setLoading(true);
    try {
      const response = await getPromoCodesPaginated({
        page: updatedPagination?.currentPage ?? pagination.currentPage,
        perPage: updatedPagination?.itemsPerPage ?? pagination.itemsPerPage,
        sortField: updatedPagination?.sortField ?? pagination.sortField,
        sortOrder: (updatedPagination?.sortOrder ?? pagination.sortOrder) as SortOrder,
        search: updatedPagination?.search ?? pagination.search,
      });

      setData(response?.data ?? []);
      setPagination((prev) => ({
        ...prev,
        currentTotalItems: response.pagination?.currentTotalItems ?? 0,
        totalItems: response.pagination?.totalItems ?? 0,
        totalPages: response.pagination?.totalPages ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = (updatedPagination: IPagination) => {
    setPagination(updatedPagination);
    fetchData(updatedPagination);
  };

  const handleRemove = () => {
    if (selected.length > 0) {
      setToDelete(selected.map((item: any) => item.id));
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if (toDelete && toDelete.length > 0) {
        await deletePromoCodes({
          ids: toDelete,
        });

        fetchData();
        setSelected([]);
        setToDelete(null);
        toast({ title: t("success"), description: t("promo_code_deleted"), type: "success" });
      }
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      if (editingPromoCode?.id) {
        await updatePromoCode({
          id: editingPromoCode.id as string,
          user_id: userId as string,
          updates: formData,
        });
        toast({ title: t("success"), description: t("promo_code_updated"), type: "success" });
      } else {
        await createPromoCode({
          ...formData,
          created_at: new Date(),
          created_by: userId as string,
        });
        toast({ title: t("success"), description: t("add_item"), type: "success" });
      }
      fetchData();
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setOpen(false);
      setEditingPromoCode(null);
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingPromoCode(null); 
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomTable
        data={data}
        columns={columns}
        pagination={pagination}
        loading={loading}
        actions={actions}
        onRequest={handleRequest}
        onAddItem={handleAddItem}
        onRemoveItens={handleRemove}
      />

      <Form
        open={open}
        data={editingPromoCode}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}