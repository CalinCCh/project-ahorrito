"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const { signIn, isLoaded } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (forgotPassword) {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email,
        });
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "complete") {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "An error occurred with Google sign in."
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-transparent border-none shadow-none">
      <CardHeader className="text-center space-y-4 pt-8 pb-0">
        <div className="mx-auto flex justify-center">
          <img src="/logo.svg" alt="Logo" className="h-32 w-32 scale-x-[-1]" />
        </div>
        <h1 className="text-3xl font-bold text-[#2E2A47]">
          {forgotPassword ? "Reset your password" : "Welcome back!"}
        </h1>
        <p className="text-base text-[#7E8CA0]">
          {forgotPassword ? (
            "Enter your email address and we'll send you a link to reset your password."
          ) : (
            <>
              Don't have an account yet?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign up now
              </Link>
            </>
          )}
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pt-8">
        {error && (
          <div className="text-base p-3 rounded-md bg-red-50 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 text-base"
              required
            />
          </div>

          {!forgotPassword && (
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 text-base pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {!forgotPassword && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="h-5 w-5" />
                <label
                  htmlFor="remember"
                  className="text-base font-medium text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-base font-medium text-blue-600"
                onClick={() => setForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : forgotPassword
              ? "Reset password"
              : "Log in"}
          </Button>

          {forgotPassword && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base"
              onClick={() => setForgotPassword(false)}
            >
              Back
            </Button>
          )}
        </form>

        {!forgotPassword && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img
                src="/google-icon.svg"
                alt="Google"
                className="h-6 w-6 mr-2"
              />
              Continue with Google
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
