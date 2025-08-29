import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";

export function UserDashboardPage() {
  const { user } = useAuthStore();
  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user?.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your license key is: <strong>{user?.licenseKey}</strong></p>
          <p className="mt-4 text-muted-foreground">This is your main dashboard. You can manage your products, orders, and AI agents from the sidebar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
