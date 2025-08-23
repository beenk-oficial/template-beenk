import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, SortOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconAlertTriangleFilled,
  IconBan,
  IconExclamationCircle,
  IconCircleDashed,
  IconFileText,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { formatToLocaleCurrency, formatToLocaleDate } from "@/utils";
import { getInvoicesPaginated } from "@/lib/supabase/api/admin/invoices";
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

  function renderStatus(row: any, t: any) {
    if (row.status) {
      let colorClass = "";
      let label = row.status;
      let Icon = null;
      switch (row.status) {
        case "draft":
          colorClass = "bg-gray-200 text-gray-800";
          label = t("draft");
          Icon = IconCircleDashed;
          break;
        case "open":
          colorClass = "bg-blue-200 text-blue-800";
          label = t("open");
          Icon = IconAlertTriangleFilled;
          break;
        case "paid":
          colorClass = "bg-green-200 text-green-800";
          label = t("paid");
          Icon = IconCircleCheckFilled;
          break;
        case "uncollectible":
          colorClass = "bg-orange-200 text-orange-800";
          label = t("uncollectible");
          Icon = IconExclamationCircle;
          break;
        case "void":
          colorClass = "bg-red-200 text-red-800";
          label = t("void");
          Icon = IconBan;
          break;
        default:
          colorClass = "bg-muted text-muted-foreground";
          label = t(row.status) || row.status;
          Icon = null;
      }
      return (
        <Badge variant="outline" className={`px-1.5 flex items-center gap-1 ${colorClass}`}>
          {Icon && <Icon size={16} />}
          {label}
        </Badge>
      );
    }
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
      label: t("amount"),
      field: "amount",
      format: formatToLocaleCurrency,
    },
    {
      label: t("status"),
      field: "status",
      component: ({ row }: { row: any }) => renderStatus(row, t),
    },
    {
      label: t("due_date"),
      field: "due_date",
      format: formatToLocaleDate,
    },
    {
      label: t("paid_at"),
      field: "paid_at",
      format: formatToLocaleDate,
    },

    {
      label: t("invoice"),
      field: "invoice_pdf_url",
      component: ({ row }: { row: any }) =>
        row.invoice_pdf_url ? (
          <a
            href={row.invoice_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
            title={t("open") + " PDF"}
          >
            <IconFileText size={18} />
            <span className="hidden md:inline">
              {row.id?.slice(-5)}
            </span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
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
      const response = await getInvoicesPaginated({
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
