import { Headphones } from "lucide-react";
import type { CSSProperties } from "react";

const HUES = [24, 210, 160, 280, 340, 40, 190];

/** Ảnh đại diện sản phẩm dạng placeholder có màu ổn định theo id (khi chưa có ảnh thật) */
export function ProductThumb({ id, size = 44 }: { id: string; size?: number }) {
  const hue = HUES[id.charCodeAt(0) % HUES.length];
  const style = {
    width: size,
    height: size,
    color: `hsl(${hue} 45% 32%)`,
    background: `linear-gradient(135deg, hsl(${hue} 70% 94%), hsl(${hue} 55% 84%))`,
    borderColor: `hsl(${hue} 40% 86%)`,
  } satisfies CSSProperties;
  return (
    <span className="inline-flex flex-none items-center justify-center rounded-sm border" style={style} aria-hidden="true">
      <Headphones className="size-5" strokeWidth={1.8} />
    </span>
  );
}
