import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router";

export function PendingLicensePage() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/user/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8" />
            <h1 className="text-2xl font-bold">ZapWA</h1>
          </div>
          <CardTitle className="text-2xl">Account Pending</CardTitle>
          <CardDescription>Welcome, {user?.name || 'User'}!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Your account is active, but you need a license to access the dashboard.
            Please contact an administrator to have a license assigned to your account.
          </p>
          <Button onClick={handleLogout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
