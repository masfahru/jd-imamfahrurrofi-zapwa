import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react"; // Import useEffect
import { Zap } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputPassword } from "@/components/ui/input-password";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super admin" | "user" | null;
};

interface SessionResponse {
  user: User;
  session: object;
}

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length > 0 ? null : "Password is required",
    },
  });
  const { mutate: submitLogin, isPending } = useMutation<
    unknown,
    Error,
    typeof form.values
  >({
    mutationFn: async (values) => {
      const res = await fetch(`${SERVER_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      setIsVerifying(true);
      form.setErrors({});

      try {
        const sessionRes = await fetch(
          `${SERVER_URL}/api/auth/get-session`,
          {
            credentials: "include",
          },
        );
        if (!sessionRes.ok) {
          throw new Error("Could not verify session. Please try again.");
        }

        const sessionData: SessionResponse = await sessionRes.json();
        const { user } = sessionData;
        login(user);

        const state = useAuthStore.getState();
        if (state.isAuthenticated) {
          navigate("/admin");
        } else {
          throw new Error(
            "You do not have permission to access the admin panel.",
          );
        }
      } catch (err: unknown) {
        await logout();
        if (err instanceof Error) {
          form.setErrors({ root: err.message });
        }
      } finally {
        setIsVerifying(false);
      }
    },
    onError: (err) => {
      form.setErrors({ root: err.message });
    },
  });

  const isLoading = isPending || isVerifying;

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <form onSubmit={form.onSubmit((values) => submitLogin(values))}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8" />
              <h1 className="text-2xl font-bold">ZapWA</h1>
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 mt-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="super@admin.com"
                required
                {...form.getInputProps("email")}
              />
              {form.errors.email && (
                <p className="text-sm text-red-500">{form.errors.email}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <InputPassword
                id="password"
                required
                {...form.getInputProps("password")}
              />
              {form.errors.password && (
                <p className="text-sm text-red-500">{form.errors.password}</p>
              )}
            </div>
            {form.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.errors.root}
              </p>
            )}
          </CardContent>
          <CardFooter className="mt-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isPending
                ? "Signing In..."
                : isVerifying
                  ? "Verifying..."
                  : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
