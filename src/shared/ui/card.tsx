import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Card({ className, padded = false, ...props }: ComponentProps<"section"> & { padded?: boolean }) {
  return (
    <section
      className={cn("min-w-0 rounded-md border border-line bg-white", padded && "px-5 py-[18px]", className)}
      {...props}
    />
  );
}

/** Card có tiêu đề + mô tả + nội dung xếp dọc (dùng cho các nhóm cài đặt) */
export function Section({
  title,
  description,
  action,
  children,
  className,
  danger = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  danger?: boolean;
}) {
  return (
    <Card padded className={cn("flex flex-col gap-3", danger && "border-danger-line", className)}>
      <CardHeader title={title} description={description} action={action} />
      {children}
    </Card>
  );
}

/** Dòng nhãn – giá trị (thông tin tài khoản, chi tiết khách hàng...) */
export function InfoRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-start gap-3 border-b border-line-2 py-2.5 text-[13.5px] last:border-b-0 max-[640px]:grid-cols-1 max-[640px]:gap-1">
      <span className="text-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Dòng thời gian: mốc giờ bên trái, sự kiện bên phải */
export function Timeline({ items }: { items: { at: string; text: ReactNode }[] }) {
  return (
    <ol className="mt-2 flex flex-col">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[120px_1fr] gap-3 border-t border-line-2 py-[9px] text-[13.5px] first:border-t-0 max-[900px]:grid-cols-1 max-[900px]:gap-0.5">
          <span className="text-[13px] text-muted">{it.at}</span>
          <span>{it.text}</span>
        </li>
      ))}
    </ol>
  );
}

/** Mã / định danh hiển thị dạng code */
export function Code({ children, subtle = false }: { children: ReactNode; subtle?: boolean }) {
  return subtle ? (
    <code className="text-xs font-medium text-muted">{children}</code>
  ) : (
    <code className="rounded-xs bg-soft px-1.5 py-0.5 text-[0.92em] font-semibold">{children}</code>
  );
}

type CardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px]">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
