import { ChartAreaInteractive } from "@/components/custom/ChartAreaInteractive";
import { DataTable } from "@/components/custom/DataTable";
import { SectionCards } from "@/components/custom/SectionCards";

import data from "./data.json";
import AdminLayout from "@/components/layout/AdminLayout";

export default function Page() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </AdminLayout>
  );
}
