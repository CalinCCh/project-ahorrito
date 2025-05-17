"use client";

import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerifying(true);
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "An error occurred with Google sign up."
      );
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md bg-transparent border-none shadow-none">
        <CardHeader className="text-center space-y-4 pt-8 pb-0">
          <div className="mx-auto flex justify-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-32 w-32 scale-x-[-1]"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#2E2A47]">
            Verify your email
          </h1>
          <p className="text-base text-[#7E8CA0]">
            We've sent a verification code to {email}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          {error && (
            <div className="text-base p-3 rounded-md bg-red-50 text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleVerification} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-base">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full h-12 text-base"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-transparent border-none shadow-none">
      <CardHeader className="text-center space-y-4 pt-8 pb-0">
        <div className="mx-auto flex justify-center">
          <img src="/logo.svg" alt="Logo" className="h-32 w-32 scale-x-[-1]" />
        </div>
        <h1 className="text-3xl font-bold text-[#2E2A47]">Create an account</h1>
        <p className="text-base text-[#7E8CA0]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
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
                autoComplete="new-password"
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

          <div id="clerk-captcha" className="mt-4" />

          <Button
            type="submit"
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign up"}
          </Button>
        </form>

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
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <img src="/google-icon.svg" alt="Google" className="h-6 w-6 mr-2" />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
};
