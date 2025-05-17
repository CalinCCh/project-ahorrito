"use client";

import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10">
      <div className="lg:col-span-7 flex items-center justify-center h-screen pb-15">
        <SignInForm />
      </div>

      <div className="hidden lg:block lg:col-span-3 bg-blue-600">
        <div className="h-full w-full relative">
          <Image
            src="/large-triangles.svg"
            alt="Decorative pattern"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
