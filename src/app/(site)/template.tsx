import { RouteTransition } from "@/components/providers/RouteTransition";

export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
