import type { Metadata } from "next";
import { bestOffer, offerOn } from "@/domain/deal";
import { PLATFORMS } from "@/domain/platform";
import { formatVnd } from "@/shared/lib/format";
import { ActionButton } from "@/shared/ui/action-button";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/banner";
import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { PlatformBadge } from "@/shared/ui/platform-badge";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { decideMatchAction } from "@/features/matching/actions";
import { getMatches, type MatchView } from "@/features/matching/server/queries";

export const metadata: Metadata = { title: "Ghép sản phẩm" };

export default async function MatchingPage() {
  const matches = await getMatches();
  const pending = matches.filter((m) => m.status === "pending");
  const decided = matches.filter((m) => m.status === "rejected");
  const confirmed = matches.filter((m) => m.status === "confirmed");

  return (
    <>
      <PageHeader title="Ghép sản phẩm" description="Gom cùng một sản phẩm trên Shopee và TikTok Shop để so giá" />
      {pending.map((m) => (
        <PendingMatch key={m.id} match={m} />
      ))}
      {decided.map((m) => (
        <Card key={m.id} padded className="flex flex-wrap items-center gap-3 text-[13px]">
          <span className="flex-1">Gợi ý cho {m.deal.name} đã bị từ chối.</span>
          <ActionButton action={decideMatchAction.bind(null, m.id, "pending")}>Hoàn tác</ActionButton>
        </Card>
      ))}
      {confirmed.map((m) => (
        <ConfirmedMatch key={m.id} match={m} />
      ))}
      {matches.length === 0 && <EmptyState>Chưa có gợi ý ghép sản phẩm nào.</EmptyState>}
    </>
  );
}

function PendingMatch({ match }: { match: MatchView }) {
  return (
    <Card className="overflow-hidden border-warn-line">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-warn-row px-[18px] py-3.5">
        <div>
          <h2 className="text-base">{match.deal.name}</h2>
          <div className="text-[13px] text-muted">{match.reason}</div>
        </div>
        <Badge tone="warn">Cần xác nhận</Badge>
      </div>
      <div className="flex flex-wrap items-stretch gap-3 px-[18px] py-4">
        {match.candidates.map((c) => (
          <div key={c.platform} className="flex-[1_1_240px] rounded-sm border border-line-2 p-3">
            <PlatformBadge platform={c.platform} />
            <div className="my-1.5 font-medium">{c.title}</div>
            <div className="text-[13px]">
              Mã model {c.modelCode} · giá cuối <span className="tnum">{formatVnd(c.finalPrice)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 px-[18px] pb-4">
        <span className="flex-[1_1_260px] text-[13px] text-warn">Kiểm tra phân loại (màu, phiên bản) trước khi xác nhận.</span>
        <ActionButton variant="primary" action={decideMatchAction.bind(null, match.id, "confirmed")}>
          Cùng sản phẩm
        </ActionButton>
        <ActionButton action={decideMatchAction.bind(null, match.id, "rejected")}>Không phải</ActionButton>
      </div>
    </Card>
  );
}

function ConfirmedMatch({ match }: { match: MatchView }) {
  const best = bestOffer(match.deal);
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-2 px-[18px] py-3.5">
        <div>
          <h2 className="text-base">{match.deal.name}</h2>
          <div className="text-[13px] text-muted">{match.reason}</div>
        </div>
        <div className="flex gap-2">
          <Badge tone="ok">Đã ghép</Badge>
          <ActionButton action={decideMatchAction.bind(null, match.id, "pending")}>Hoàn tác</ActionButton>
        </div>
      </div>
      <TableScroll>
        <Table>
          <thead>
            <tr>
              <Th>Sàn</Th>
              <Th>Giá niêm yết</Th>
              <Th>Mã</Th>
              <Th>Giá cuối</Th>
              <Th>Hoa hồng</Th>
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => {
              const o = offerOn(match.deal, p);
              if (!o) return null;
              return (
                <Tr key={p} tone={best.platform === p ? "best" : undefined}>
                  <Td>
                    <PlatformBadge platform={p} />
                  </Td>
                  <Td className="tnum">{formatVnd(o.listPrice)}</Td>
                  <Td className="tnum">{o.coupon ? `−${formatVnd(o.coupon)}` : <span className="text-muted">Không có</span>}</Td>
                  <Td className="tnum">
                    <b>{formatVnd(o.finalPrice)}</b>
                  </Td>
                  <Td className="tnum">{o.commissionRate}%</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </TableScroll>
    </Card>
  );
}
