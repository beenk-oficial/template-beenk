import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import  { type IPagination, SortOrder, SubscriptionStatus } from "@/types";

import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconAlertTriangleFilled,
  IconClockFilled,
  IconBan,
  IconExclamationCircle,
  IconCircleDashed,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { formatToLocaleDate } from "@/utils";
import { useSession } from "@/hooks/useSession";

export default function Page() {
  const {t} = useTranslation("general");
  const { companyId } = useSession();
  const [data, setData] = useState([]);

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

  function renderStatus(row: any, t: any) {
    if (row.status) {
      let colorClass = "";
      let label = row.status;
      let Icon = null;
      switch (row.status) {
        case SubscriptionStatus.INCOMPLETE:
          colorClass = "bg-yellow-200 text-yellow-800";
          label = t("incomplete");
          Icon = IconCircleDashed;
          break;
        case SubscriptionStatus.INCOMPLETE_EXPIRED:
          colorClass = "bg-gray-200 text-gray-800";
          label = t("incomplete_expired");
          Icon = IconClockFilled;
          break;
        case SubscriptionStatus.TRIALING:
          colorClass = "bg-blue-200 text-blue-800";
          label = t("trialing");
          Icon = IconAlertTriangleFilled;
          break;
        case SubscriptionStatus.ACTIVE:
          colorClass = "bg-green-200 text-green-800";
          label = t("active");
          Icon = IconCircleCheckFilled;
          break;
        case SubscriptionStatus.PAST_DUE:
          colorClass = "bg-orange-200 text-orange-800";
          label = t("past_due");
          Icon = IconExclamationCircle;
          break;
        case SubscriptionStatus.CANCELED:
          colorClass = "bg-red-200 text-red-800";
          label = t("canceled");
          Icon = IconBan;
          break;
        case SubscriptionStatus.UNPAID:
          colorClass = "bg-pink-200 text-pink-800";
          label = t("unpaid");
          Icon = IconCircleXFilled;
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
      label: t("email"),
      field: "email",
    },
    {
      label: t("status"),
      field: "status",
      component: ({ row }: { row: any}) => renderStatus(row, t),
    },
    {
      label: t("plan"),
      field: "plan_id",
    },
    {
      label: t("trial_start"),
      field: "trial_start",
      sortable: true,
      format: formatToLocaleDate,
    },
    {
      label: t("trial_end"),
      field: "trial_end",
      format: formatToLocaleDate,
    },
    {
      label: t("current_period_start"),
      field: "current_period_start",
      sortable: true,
      format: formatToLocaleDate,
    },
    {
      label: t("current_period_end"),
      field: "current_period_end",
      format: formatToLocaleDate,
    },
    {
      label: t("canceled_at"),
      field: "canceled_at",
      sortable: true,
      format: formatToLocaleDate,
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
      const { getSubscriptionPaginated } = await import("@/lib/supabase/api/admin/subscription");
      const response = await getSubscriptionPaginated({
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
      }
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
