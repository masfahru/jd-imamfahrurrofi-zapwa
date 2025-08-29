import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputPassword } from "@/components/ui/input-password";
import { useState } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export function UserSignupPage() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length < 8 ? "Password must be at least 8 characters"
        : null),
      confirmPassword: (value, values) => (value !== values.password ? "Passwords do not match" : null),
    },
  });
  const { mutate: submitSignup, isPending } = useMutation({
    mutationFn: async (values: typeof form.values) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...signupData } = values;
      const res = await fetch(`${SERVER_URL}/api/user/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (!res.ok) {

        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Signup failed");
      }
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      form.setErrors({});
      setSuccessMessage("Account created successfully! You can now log in.");
      setTimeout(() => navigate('/user/login'), 3000);
    },
    onError: (err) => {
      if (err instanceof Error) {

        form.setErrors({ root: err.message });
      }
    },
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <form onSubmit={form.onSubmit((values) => submitSignup(values))}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8" />
              <h1 className="text-2xl font-bold">ZapWA</h1>

            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Enter your details to create a new user account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 mt-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>

              <Input id="name" type="text" placeholder="John Doe" required {...form.getInputProps("name")} />
              {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required {...form.getInputProps("email")} />

              {form.errors.email && <p className="text-sm text-red-500">{form.errors.email}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <InputPassword id="password" required {...form.getInputProps("password")} />
              {form.errors.password && <p className="text-sm text-red-500">{form.errors.password}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <InputPassword id="confirmPassword" required {...form.getInputProps("confirmPassword")} />
              {form.errors.confirmPassword && <p className="text-sm text-red-500">{form.errors.confirmPassword}</p>}
            </div>
            {form.errors.root && <p className="text-sm font-medium text-destructive">{form.errors.root}</p>}

            {successMessage && <p className="text-sm font-medium text-green-600">{successMessage}</p>}
          </CardContent>
          <CardFooter className="mt-3 flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ?
                "Creating Account..." : "Sign Up"}
            </Button>
            <Button variant="link" size="sm" onClick={() => navigate('/user/login')}>
              Already have an account?
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
