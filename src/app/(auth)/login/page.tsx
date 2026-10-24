import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/shared/ui/logo";
import { Skeleton } from "@/shared/ui/banner";
import { LoginForm } from "@/features/auth/components/login-form";
import { TwoFactorForm } from "@/features/auth/components/two-factor-form";
import { readPending2fa } from "@/server/auth/session";
import { repositories } from "@/server/container";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-panel px-4 py-8">
      <div className="flex w-full max-w-[400px] flex-col gap-3.5 rounded-md border border-line bg-white p-7 shadow-[0_1px_2px_rgb(24_24_27/0.04)]">
        <div className="mb-1.5">
          <Logo href="/" />
        </div>
        {/* searchParams và cookie là dữ liệu theo request => nằm trong Suspense */}
        <Suspense fallback={<Skeleton className="h-72" />}>
          <LoginStep searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginStep({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  if (params.step === "2fa" && (await readPending2fa())) {
    return <TwoFactorForm next={next} />;
  }

  const notice = next?.startsWith("/admin")
    ? "Trang này chỉ dành cho quản trị viên. Đăng nhập bằng tài khoản quản trị để tiếp tục."
    : next?.startsWith("/app")
      ? "Đăng nhập để vào trang quản lý."
      : undefined;
  const { trialDays } = await repositories().platform.get();
  return <LoginForm next={next} notice={notice} trialDays={trialDays} />;
}
