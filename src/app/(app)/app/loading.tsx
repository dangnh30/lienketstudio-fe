import { Skeleton } from "@/shared/ui/banner";

export default function Loading() {
  return (
    <div className="flex flex-col gap-[22px]" aria-busy="true" aria-label="Đang tải">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-32" />
      <Skeleton className="h-72" />
    </div>
  );
}
