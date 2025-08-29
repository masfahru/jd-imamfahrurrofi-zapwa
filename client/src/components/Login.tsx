import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useState } from "react";
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

  if (isAuthenticated) {
    navigate("/admin", { replace: true });
  }

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
    // Login response is now just used to confirm success, we don't need its body
    unknown,
    Error,
    typeof form.values
  >({
    mutationFn: async (values) => {
      const res = await fetch(`${SERVER_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        // IMPORTANT: This tells the browser to handle the Set-Cookie header
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      // We don't need to return the body, the cookie is now set
      return res.json();
    },
    onSuccess: async () => {
      setIsVerifying(true);
      form.setErrors({});

      try {
        // The browser will now automatically send the cookie
        const sessionRes = await fetch(
          `${SERVER_URL}/api/auth/get-session`,
          {
            // IMPORTANT: This tells the browser to send cookies with the request
            credentials: "include",
          },
        );

        if (!sessionRes.ok) {
          throw new Error("Could not verify session. Please try again.");
        }

        const sessionData: SessionResponse = await sessionRes.json();
        const { user } = sessionData;

        // Pass the user object to the store
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <form onSubmit={form.onSubmit((values) => submitLogin(values))}>
          <CardHeader>
            {/* ... form content is unchanged ... */}
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
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
          <CardFooter>
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
