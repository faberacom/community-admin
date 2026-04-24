"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Image from "next/image";
import { useAuth } from "@/src/contexts/auth.context";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { LoginCredentials } from "@/src/types";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      await login(data);
      router.push("/dashboard");
    } catch (error) {
      const message =
        (error as { message?: string })?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/images/logo-word.png"
          alt="Nigerian Community"
          width={160}
          height={48}
          priority
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="admin@example.com"
            required
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Nigerian Community Admin Dashboard
      </p>
    </div>
  );
}
