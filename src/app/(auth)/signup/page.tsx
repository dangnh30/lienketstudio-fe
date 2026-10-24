import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/shared/ui/banner";
import { Logo } from "@/shared/ui/logo";
import { repositories } from "@/server/container";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-panel px-4 py-8">
      <div className="flex w-full max-w-[400px] flex-col gap-3.5 rounded-md border border-line bg-white p-7 shadow-[0_1px_2px_rgb(24_24_27/0.04)]">
        <div className="mb-1.5">
          <Logo href="/" />
        </div>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <SignupStep />
        </Suspense>
      </div>
    </div>
  );
}

/** Đọc cài đặt nền tảng mỗi request: admin có thể tắt đăng ký hoặc đổi số ngày dùng thử bất cứ lúc nào */
async function SignupStep() {
  await connection(); // luôn render theo request, không đóng băng vào HTML lúc build
  const { trialDays, signupEnabled } = await repositories().platform.get();
  return <SignupForm trialDays={trialDays} signupEnabled={signupEnabled} />;
}
