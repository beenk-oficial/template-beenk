import { CustomTable } from "@/components/custom/Table/CustomTable";
import { useState, useEffect } from "react";
import { type IPagination, SortOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconAlertTriangleFilled,
  IconGift,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { formatToLocaleDate } from "@/utils";
import { getReferralsPaginated } from "@/lib/supabase/api/admin/referrals";
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

  function renderStatus(row: any) {
    let colorClass = "";
    let label = row.status;
    let Icon = null;
    switch (row.status) {
      case "pending":
        colorClass = "bg-yellow-200 text-yellow-800";
        label = t("pending");
        Icon = IconAlertTriangleFilled;
        break;
      case "accepted":
        colorClass = "bg-green-200 text-green-800";
        label = t("accepted");
        Icon = IconCircleCheckFilled;
        break;
      case "rewarded":
        colorClass = "bg-blue-200 text-blue-800";
        label = t("rewarded");
        Icon = IconGift;
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
      label: t("referrer_user"),
      field: "referrer_user",
      component: ({ row }: { row: any }) =>
        row.referrer_user ? (
          <div>
            <div className="font-medium">{row.referrer_user.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.referrer_user.email}</div>
          </div>
        ) : "-",
    },
    {
      label: t("referred_user"),
      field: "referred_user",
      component: ({ row }: { row: any }) =>
        row.referred_user ? (
          <div>
            <div className="font-medium">{row.referred_user.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.referred_user.email}</div>
          </div>
        ) : "-",
    },
    {
      label: t("referral_code"),
      field: "referral_code",
      sortable: true,
    },
    {
      label: t("status"),
      field: "status",
      component: ({ row }: { row: any }) => renderStatus(row),
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
      const response = await getReferralsPaginated({
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