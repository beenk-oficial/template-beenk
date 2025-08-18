import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, type License, SortOrder } from "@/types";
import { useTranslation } from "react-i18next";
import { formatToLocaleDate } from "@/utils";
import { createLicense, updateLicense, deleteLicense, getLicensesPaginated } from "@/lib/supabase/api/admin/licenses";
import { useToast } from "@/components/ui/toast";
import { ConfirmDeleteDialog } from "@/components/custom/Dialog/CustomDialog";
import Form from "./form";
import { useSession } from "@/hooks/useSession";

export default function Page() {
  const { t } = useTranslation("general");
  const [data, setData] = useState<License[]>([]);

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
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const { userId } = useSession();

  const toast = useToast();

  const columns = [
    {
      label: t("name"),
      field: "name",
      sortable: true,
    },
    {
      label: t("description"),
      field: "description",
      format: (value: string) =>
        value && value.length > 100 ? value.slice(0, 100) + "..." : value,
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
      setEditingLicense(updatedData);
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
      const response = await getLicensesPaginated({
        page: updatedPagination?.currentPage ?? pagination.currentPage,
        perPage: updatedPagination?.itemsPerPage ?? pagination.itemsPerPage,
        sortField: updatedPagination?.sortField ?? pagination.sortField,
        sortOrder: (updatedPagination?.sortOrder ?? pagination.sortOrder) as SortOrder,
        search: updatedPagination?.search ?? pagination.search,
      });

      setData((response?.data ?? []) as License[]);
      setPagination((prev) => ({
        ...prev,
        currentTotalItems: response.pagination?.currentTotalItems ?? 0,
        totalItems: response.pagination?.totalItems ?? 0,
        totalPages: response.pagination?.totalPages ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching licenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = (updatedPagination: IPagination) => {
    setPagination(updatedPagination);
    fetchData();
  };

  const handleRemove = () => {
    if (selected.length > 0) {
      setToDelete(selected.map((item: License) => item.id));
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if (toDelete && toDelete.length > 0) {
        await deleteLicense({ ids: toDelete });
        fetchData();
        setSelected([]);
        setToDelete(null);
        toast({ title: t("success"), description: t("license_deleted"), type: "success" });
      }
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: License) => {
    try {
      setLoading(true);
      if (editingLicense?.id) {
        await updateLicense({
          id: editingLicense.id as string,
          user_id: userId as string,
          updates: formData,
        });
        toast({ title: t("success"), description: t("license_updated"), type: "success" });
      } else {
        await createLicense({
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
      setEditingLicense(null);
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingLicense(null);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomTable
        data={data}
        columns={columns}
        pagination={pagination}
        loading={loading}
        selected={selected}
        actions={actions}
        onRowSelectionChange={setSelected}
        onRequest={handleRequest}
        onAddItem={handleAddItem}
        onRemoveItens={handleRemove}
      />

      <Form
        open={open}
        data={editingLicense}
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