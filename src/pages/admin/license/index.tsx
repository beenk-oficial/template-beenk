import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, type Plan, SortOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { formatToLocaleCurrency, formatToLocaleDate } from "@/utils";
import { deletePlans, getPlansPaginated, updatePlan, createPlan } from "@/lib/supabase/api/admin/plans";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDeleteDialog } from "@/components/custom/Dialog/CustomDialog";
import Form from "./form";
import { useSession } from "@/hooks/useSession";
import { set } from "zod";

export default function Page() {
  const { t } = useTranslation("general");
  const [data, setData] = useState<Plan[]>([]);

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
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const { userId } = useSession();

  const toast = useToast();

  const columns = [
    {
      label: t("name"),
      field: "name",
      sortable: true,
    },
    {
      label: t("license"),
      field: "license_id",
    },
    {
      label: t("monthly_price"),
      field: "monthly_price",
      sortable: true,
      format: formatToLocaleCurrency,
    },
    {
      label: t("duration_months"),
      field: "duration_months",
      sortable: true,
    },
    {
      label: t("discount_percent"),
      field: "discount_percent",
      format: (value: number) => value != null ? `${value}%` : "-",
    },
    {
      label: t("original_price"),
      field: "original_price",
      format: formatToLocaleCurrency,
    },
    {
      label: t("discount_price"),
      field: "discount_price",
      format: formatToLocaleCurrency,
    },
    {
      label: t("status"),
      field: "is_active",
      component: ({ row }: { row: any }) => {
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.is_active ? (
              <IconCircleCheckFilled className="fill-green-400" />
            ) : (
              <IconCircleXFilled className="fill-red-400" />
            )}
            {row.is_active ? t("active") : t("inactive")}{" "}
          </Badge>
        );
      },
    },
    {
      label: t("created_at"),
      field: "created_at",
      sortable: true,
      format: formatToLocaleDate,
    },
  ];

  const fetchData = async (updatedPagination: IPagination | null = null) => {
    setLoading(true);
    try {
      const response = await getPlansPaginated({
        page: updatedPagination?.currentPage ?? pagination.currentPage,
        perPage: updatedPagination?.itemsPerPage ?? pagination.itemsPerPage,
        sortField: updatedPagination?.sortField ?? pagination.sortField,
        sortOrder: (updatedPagination?.sortOrder ?? pagination.sortOrder) as SortOrder,
        search: updatedPagination?.search ?? pagination.search,
      });

      setData((response?.data ?? []) as Plan[]);
      setPagination((prev) => ({
        ...prev,
        currentTotalItems: response.pagination?.currentTotalItems ?? 0,
        totalItems: response.pagination?.totalItems ?? 0,
        totalPages: response.pagination?.totalPages ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
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
      setToDelete(selected.map((item: Plan) => item.id));
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if (toDelete && toDelete.length > 0) {
        await deletePlans({
          ids: toDelete,
        });

        fetchData();
        setSelected([]);
        setToDelete(null);
        toast({ title: t("success"), description: t("user_deleted"), type: "success" });
      }
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<Plan>) => {
    try {
      setLoading(true);
      if (editingPlan?.id) {
        await updatePlan({
          id: editingPlan.id as string,
          user_id: userId as string,
          updates: formData,
        });
        toast({ title: t("success"), description: t("user_updated"), type: "success" });
      } else {
        await createPlan({
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
      setEditingPlan(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomTable
        data={data}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onRequest={handleRequest}
        onAddItem={() => setOpen(true)}
        onRemoveItens={handleRemove}
      />

      <Form
        open={open}
        data={editingPlan}
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