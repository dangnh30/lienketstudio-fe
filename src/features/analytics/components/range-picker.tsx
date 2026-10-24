import { Segment, Segmented } from "@/shared/ui/segmented";
import { RANGES, type Range } from "../range";

/** Chọn khoảng thời gian qua URL (?range=) – giữ nguyên các tham số khác */
export function RangePicker({ basePath, current, params = {} }: { basePath: string; current: Range; params?: Record<string, string> }) {
  return (
    <Segmented label="Khoảng thời gian">
      {RANGES.map((r) => (
        <Segment key={r} href={`${basePath}?${new URLSearchParams({ ...params, range: String(r) })}`} active={r === current}>
          {r} ngày
        </Segment>
      ))}
    </Segmented>
  );
}
