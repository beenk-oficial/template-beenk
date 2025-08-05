import * as React from "react";

import { NavMain } from "@/components/custom/NavMain";
import { NavUser } from "@/components/custom/NavUser";
import { TeamSwitcher } from "@/components/custom/TeamSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: {
    teams: any[];
    navMain: any[];
    user: any;
  };
};

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
