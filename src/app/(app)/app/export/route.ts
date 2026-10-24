import type { NextRequest } from "next/server";
import { bestOffer } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";
import { requireCustomer } from "@/server/auth/dal";
import { repositories } from "@/server/container";
import { parseRange } from "@/features/analytics/range";

type Cell = string | number;

function toCsv(rows: Cell[][]) {
  const escape = (v: Cell) => `"${String(v).replace(/"/g, '""')}"`;
  // BOM UTF-8 để Excel hiển thị đúng tiếng Việt
  return "﻿" + rows.map((line) => line.map(escape).join(",")).join("\r\n");
}

/** Xuất CSV: ?type=performance|income&range=7|30|90, hoặc ?type=data (toàn bộ sản phẩm theo dõi) */
export async function GET(request: NextRequest) {
  const { workspaceId } = await requireCustomer();
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  const { stats, deals } = repositories();
  let rows: Cell[][];
  let name: string;

  if (type === "data") {
    const list = await deals.listByWorkspace(workspaceId);
    rows = [
      ["Mã", "Sản phẩm", "Trạng thái", "Điểm", "Giá TB 30 ngày", "Thấp nhất 90 ngày", "Giá tốt nhất", "Sàn", "Lịch sử giá"],
      ...list.map((d) => {
        const o = bestOffer(d);
        return [d.id, d.name, d.status, d.score, d.avg30, d.low90, o.finalPrice, PLATFORM_LABEL[o.platform], d.priceHistory.join(" ")];
      }),
    ];
    name = "lienket-du-lieu.csv";
  } else {
    const days = parseRange(params.get("range") ?? undefined);
    const income = type === "income";
    const daily = await stats.daily(workspaceId, days);
    rows = [
      income ? ["Ngày", "Đơn", "Hoa hồng (VND)"] : ["Ngày", "Lượt bấm", "Đơn", "Hoa hồng (VND)"],
      ...daily.map((r) => (income ? [r.date, r.orders, r.commission] : [r.date, r.clicks, r.orders, r.commission])),
    ];
    name = `lienket-${income ? "thu-nhap" : "thong-ke"}-${days}-ngay.csv`;
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
