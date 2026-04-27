import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="pb-16">{children}</div>
      <BottomNav />
    </RouteGuard>
  );
}
