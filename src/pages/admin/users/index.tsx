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
import { getUserPaginated } from "@/lib/supabase/api/admin/user";
import { useSession } from "@/hooks/useSession";

export default function Page() {
  const { t } = useTranslation("general");
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const { companyId } = useSession();

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
      label: t("name"),
      field: "full_name",
      sortable: true,
    },
    {
      label: t("email"),
      field: "email",
      sortable: true,
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
        company_id: companyId || "",
        page: updatedPagination?.currentPage ?? pagination.currentPage,
        perPage: updatedPagination?.itemsPerPage ?? pagination.itemsPerPage,
        sortField: updatedPagination?.sortField ?? pagination.sortField,
        sortOrder: updatedPagination?.sortOrder ?? pagination.sortOrder,
        search: updatedPagination?.search ?? pagination.search,
      });

      if (!response.error) {
        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          currentTotalItems: response.pagination.currentTotalItems,
          totalItems: response.pagination.totalItems,
          totalPages: response.pagination.totalPages,
        }));
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const handleSubmitUser = (formData: Partial<User>) => {
    if (editingUser) {
      console.log("Updating user:", { ...editingUser, ...formData });
      // Implement update logic here
    } else {
      console.log("Creating user:", formData);
      // Implement create logic here
    }
    setOpen(false);
  };

  const handleRemoveUsers = () => {
    if (selected.length > 0) {
      setToDelete(selected.map((item: User) => item.id));
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await customFetch("/api/admin/users/delete", {
        method: "DELETE",
        body: { ids: toDelete },
      });

      if (response.ok) {
        fetchData();
        setSelected([]);
      }
    } catch (error) {
      console.error("Error deleting user(s):", error);
    } finally {
      setToDelete(null);
      setDeleteDialogOpen(false);
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
