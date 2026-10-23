import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-8 text-black/60 dark:text-white/60">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link href="/" className="underline">
        Về trang chủ
      </Link>
    </div>
  );
}
