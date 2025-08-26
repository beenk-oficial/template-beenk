import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, type Payment, PaymentStatus, SortOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconAlertTriangleFilled,
  IconCircleXFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { formatToLocaleCurrency, formatToLocaleDate } from "@/utils";
import { getPaymentsPaginated } from "@/lib/supabase/api/admin/payments";
import { useToast } from "@/components/ui/toast";

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

  const toast = useToast();

  function renderStatus(row: Payment, t: any) {
    let colorClass = "";
    let label = row.status;
    let Icon = null;
    switch (row.status) {
      case PaymentStatus.PAID:
        colorClass = "bg-green-200 text-green-800";
        label = t("paid");
        Icon = IconCircleCheckFilled;
        break;
      case PaymentStatus.PENDING:
        colorClass = "bg-yellow-200 text-yellow-800";
        label = t("pending");
        Icon = IconAlertTriangleFilled;
        break;
      case PaymentStatus.FAILED:
        colorClass = "bg-red-200 text-red-800";
        label = t("failed");
        Icon = IconCircleXFilled;
        break;
      default:
        colorClass = "bg-muted text-muted-foreground";
        label = row.status;
        Icon = null;
    }
    return (
      <Badge variant="outline" className={`px-1.5 flex items-center gap-1 ${colorClass}`}>
        {Icon && <Icon size={16} />}
        {label}
      </Badge>
    );
  }

  const columns = [
    {
      label: t("user"),
      field: "users",
      component: ({ row }: { row: any }) =>
        row.users ? (
          <div>
            <div className="font-medium">{row.users.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.users.email}</div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      label: t("amount_total"),
      field: "amount_total",
      sortable: true,
      format: formatToLocaleCurrency,
    },
    {
      label: t("platform_fee"),
      field: "platform_fee",
      sortable: true,
      format: (value: number) => `${(value).toFixed(2)} %`,
    },
    {
      label: t("amount_received"),
      field: "amount_received",
      sortable: true,
      format: formatToLocaleCurrency,
    },
    {
      label: t("status"),
      field: "status",
      component: ({ row }: { row: Payment }) => renderStatus(row, t),
    },
    {
      label: "Stripe ID",
      field: "stripe_payment_id",
      sortable: true,
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
      const response = await getPaymentsPaginated({
        page: updatedPagination?.currentPage ?? pagination.currentPage,
        perPage: updatedPagination?.itemsPerPage ?? pagination.itemsPerPage,
        sortField: updatedPagination?.sortField ?? pagination.sortField,
        sortOrder: updatedPagination?.sortOrder ?? pagination.sortOrder,
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomTable
        data={data}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onRequest={handleRequest}
      />
    </div>
  );
}
