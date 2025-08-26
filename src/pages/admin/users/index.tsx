import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, SortOrder, type User } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconUser,
  IconShieldCheck,
  IconUserCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import Form from "./form";
import { ConfirmDeleteDialog } from "@/components/custom/Dialog/CustomDialog";
import { getUserPaginated, deleteUsers, updateUser } from "@/lib/supabase/api/admin/user";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/hooks/useSession";

export default function Page() {
  const { t } = useTranslation("general");
  const [data, setData] = useState([] as User[]);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const { userId } = useSession()
  const toast = useToast();

  const [pagination, setPagination] = useState<IPagination>({
    sortField: "full_name",
    sortOrder: SortOrder.ASC,
    currentPage: 1,
    itemsPerPage: 10,
    currentTotalItems: 0,
    totalItems: 0,
    totalPages: 0,
    search: "",
  });
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      label: t("user"),
      field: "full_name",
      sortable: true,
      component: ({ row }: { row: any }) =>
         (
          <div>
            <div className="font-medium">{row.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        ) 
    },
    {
      label: t("type"),
      field: "type",
      component: ({ row }: { row: any }) => {
        const getTypeIcon = (type: string) => {
          switch (type) {
            case "admin":
              return <IconShieldCheck className="mr-1 text-blue-500" />;
            case "user":
              return <IconUser className="mr-1 text-green-500" />;
            case "guest":
              return <IconUserCircle className="mr-1 text-gray-500" />;
            default:
              return null;
          }
        };

        return (
          <Badge
            variant="outline"
            className="text-muted-foreground px-1.5 flex items-center"
          >
            {getTypeIcon(row.type)}
            {t(row.type)}
          </Badge>
        );
      },
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
      label: t("banned"),
      field: "is_banned",
      component: ({ row }: { row: any }) => {
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.is_banned ? (
              <IconCircleXFilled className="fill-red-400" />
            ) : (
              <IconCircleCheckFilled className="fill-green-400" />
            )}
            {row.is_banned ? t("yes") : t("no")}
          </Badge>
        );
      },
    },
    {
      label: t("created_at"),
      field: "created_at",
      format: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString(navigator.language, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
  ];

  const actions = {
    update: (updatedData: any) => {
      setEditingUser(updatedData);
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
      const response = await getUserPaginated({
        page: updatedPagination?.currentPage ?? pagination.currentPage,
        perPage: updatedPagination?.itemsPerPage ?? pagination.itemsPerPage,
        sortField: updatedPagination?.sortField ?? pagination.sortField,
        sortOrder: (updatedPagination?.sortOrder ?? pagination.sortOrder) as SortOrder,
        search: updatedPagination?.search ?? pagination.search,
      });

      setData((response?.data) ?? []);
      setPagination((prev) => ({
        ...prev,
        currentTotalItems: response.pagination?.currentTotalItems ?? 0,
        totalItems: response.pagination?.totalItems ?? 0,
        totalPages: response.pagination?.totalPages ?? 0,
      }));
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
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

  const handleSubmitUser = async (formData: Partial<User>) => {
    try {
      setLoading(true);
      await updateUser({
        id: editingUser?.id as string,
        user_id: userId as string,
        updates: formData,
      });

      toast({ title: t("success"), description: t("user_updated"), type: "success" });
      fetchData();
    } catch (error) {
      toast({ title: t("error"), description: t("error_occurred"), type: "error" });
    } finally {
      setOpen(false);
      setEditingUser(null);
      setLoading(false);
    }
  };

  const handleRemoveUsers = () => {
    if (selected.length > 0) {
      setToDelete(selected.map((item: User) => item.id));
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if (toDelete && toDelete.length > 0) {
        await deleteUsers({
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomTable
        data={data}
        columns={columns}
        pagination={pagination}
        selected={selected}
        loading={loading}
        actions={actions}
        onRowSelectionChange={setSelected}
        onRequest={handleRequest}
        onRemoveItens={handleRemoveUsers}
      />

      <Form
        open={open}
        data={editingUser}
        onOpenChange={setOpen}
        onSubmit={handleSubmitUser}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
