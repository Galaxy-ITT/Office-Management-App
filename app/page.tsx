import { Home_Page } from "@/components/home_page";
// import { DashboardLayoutComponent } from "@/components/dashboard-layout";
import { DashboardLayoutComponent } from "@/components/dashboardLatest";
import { AdminLoginComponent } from "@/components/admin-login";
import LandingPage from "@/components/landing-page";
import { initTables } from "./database/tables/initTable";
// import { AdminLoginComponent } from "@/components/admin-login";

export default function Home() {
  return (
    <>
        <LandingPage />      
    </>
  );
}
