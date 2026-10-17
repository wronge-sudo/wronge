import { Suspense } from "react";
import Image from "next/image";
import { ASSETS, asset } from "@/config/assets";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <main className="halftone-dark flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-paper p-8 shadow-2xl">
        <Image src={asset(ASSETS.wordmarkBlack)} alt="Wronge" width={980} height={210} className="h-7 w-auto" loading="eager" />
        <p className="eyebrow mt-6 text-muted">Admin panel</p>
        <h1 className="display-narrow mt-1 text-3xl">Sign in</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
