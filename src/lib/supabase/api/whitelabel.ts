//import { supabase } from "@/lib/supabase";

import type { WhiteLabel } from "@/types";

const whitelabelData = {
  id: "whitelabel-1",
  colors: {
    background: "#1E1B2E",
    foreground: "#F5F5FF",

    radius: "6px",
    card: "#2C2547",
    "card-foreground": "#FFFFFF",

    popover: "#3A2F5E",
    "popover-foreground": "#EDE9FE",

    primary: "#8A22F2",
    "primary-foreground": "#FFFFFF",

    secondary: "#3D1673",
    "secondary-foreground": "#FFFFFF",

    muted: "#7C1BA6",
    "muted-foreground": "#D8B4FE",

    accent: "#7C1ED9",
    "accent-foreground": "#FFFFFF",

    destructive: "#DC3545",
    border: "#4E3C63",
    input: "#2A213D",
    ring: "#8A22F2",

    chart1: "#7C1BA6",
    chart2: "#8A22F2",
    chart3: "#7C1ED9",
    chart4: "#3D1673",
    chart5: "#AA22F2",

    sidebar: "#1A112F",
    "sidebar-foreground": "#F5F5F5",

    "sidebar-primary": "#A950FF",
    "sidebar-primary-foreground": "#0D011A",

    "sidebar-accent": "#9B40F9",
    "sidebar-accent-foreground": "#0D011A",

    "sidebar-border": "#3E325F",
    "sidebar-ring": "#C48CFF",
  },

  name: "Beenk",
  logo_url: "/beenk.png",
  favicon_url: "/beenk_favicon.png",
  email: "beenk@gmail.com",
  marketing_banner: {
    login: "/marketing-banner.svg",
    signup: "/marketing-banner.svg",
    change_password: "/marketing-banner.svg",
    request_password_reset: "/marketing-banner.svg",
  },
};

export async function getWhitelabel(data: { company_id: string; }) {
  console.log("@TODO: Fetching WHITELABEL data:", data);
  const { company_id } = data;

  //if (!company_id) {
  //  return { error: "Company ID is required" };
  //}

  try {
    //const query = supabase
    //  .from("white_labels")
    //  .select(
    //    "id, name, logo_url, favicon_url, colors"
    //  ).eq("company_id", company_id);
//
    //const { data: whitelabel, error } = await query.single();
//
    //if (error || !whitelabel) {
    //  return { error: "Whitelabel not found" };
    //}

    return whitelabelData;
  } catch (error) {
    return { error: "Unexpected error occurred" };
  }
}
