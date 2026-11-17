import type { Metadata } from "next";
import ControlDashboard from "@/components/control/ControlDashboard";
export const metadata: Metadata = {
  title: { absolute: "Beyonn Control | Private workspace" },
  robots: { index: false, follow: false },
};
export default function ControlPage() {
  return <ControlDashboard />;
}
