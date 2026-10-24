"use client";

import { useOptimistic, useState, useTransition } from "react";
import { bestOffer, canPublishTo, priceChangePercent, reviewState, type Deal } from "@/domain/deal";
import { CHANNEL_LABEL, CHANNELS, type Channel } from "@/domain/platform";
import type { ActionResult } from "@/shared/lib/action-result";
import { formatSignedPercent, formatVnd } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { PlatformBadge } from "@/shared/ui/platform-badge";
import { ProductThumb } from "@/shared/ui/product-thumb";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { useToast } from "@/shared/ui/toast";
import { approveDealAction, approveManyDealsAction, setDealChannelAction, skipDealAction } from "../actions";

type ReviewTableProps = { deals: Deal[]; minScore: number };

type ChannelPatch = { dealId: string; channel: Channel; enabled: boolean };

export function ReviewTable({ deals, minScore }: ReviewTableProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(deals.filter((d) => reviewState(d, minScore) === "reviewable").map((d) => d.id)),
  );
  // Cập nhật kênh ngay trên UI, đồng bộ server phía sau
  const [optimisticDeals, applyChannel] = useOptimistic(deals, (state, patch: ChannelPatch) =>
    state.map((d) => (d.id === patch.dealId ? { ...d, channels: { ...d.channels, [patch.channel]: patch.enabled } } : d)),
  );

  const selectedIds = optimisticDeals.filter((d) => selected.has(d.id) && reviewState(d, minScore) === "reviewable").map((d) => d.id);

  function run(action: () => Promise<ActionResult<unknown>>) {
    startTransition(async () => {
      const result = await action();
      toast(result.ok ? (result.message ?? "Đã lưu") : result.error);
    });
  }

  function toggleChannel(patch: ChannelPatch) {
    startTransition(async () => {
      applyChannel(patch);
      const result = await setDealChannelAction(patch);
      if (!result.ok) toast(result.error);
    });
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <>
      <PageHeader
        title="Duyệt deal"
        description={`Điểm tối thiểu ${minScore} · chọn kênh đăng cho từng deal trước khi duyệt`}
        actions={
          <Button
            variant="primary"
            disabled={!selectedIds.length || pending}
            onClick={() => run(() => approveManyDealsAction(selectedIds))}
          >
            Duyệt {selectedIds.length} deal đã chọn
          </Button>
        }
      />

      <Card>
        <TableScroll>
          <Table className="min-w-[900px]" aria-busy={pending}>
            <thead>
              <tr>
                <Th>Sản phẩm và giá theo sàn</Th>
                <Th>So TB 30 ngày</Th>
                <Th>Điểm</Th>
                <Th>Hoa hồng</Th>
                <Th>Kênh đăng</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {optimisticDeals.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-muted">
                    Không còn deal nào chờ duyệt.
                  </Td>
                </tr>
              )}
              {optimisticDeals.map((deal) => (
                <ReviewRow
                  key={deal.id}
                  deal={deal}
                  minScore={minScore}
                  selected={selected.has(deal.id)}
                  disabled={pending}
                  onSelect={(checked) => toggleSelected(deal.id, checked)}
                  onToggleChannel={(channel, enabled) => toggleChannel({ dealId: deal.id, channel, enabled })}
                  onApprove={() => run(() => approveDealAction(deal.id))}
                  onSkip={() => run(() => skipDealAction(deal.id))}
                />
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
      <p className="text-[13px] text-muted">
        TikTok chỉ gắn được giỏ hàng cho sản phẩm TikTok Shop, nên ô TikTok bị khóa với sản phẩm chỉ có trên Shopee.
      </p>
    </>
  );
}

type ReviewRowProps = {
  deal: Deal;
  minScore: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (checked: boolean) => void;
  onToggleChannel: (channel: Channel, enabled: boolean) => void;
  onApprove: () => void;
  onSkip: () => void;
};

function ReviewRow({ deal, minScore, selected, disabled, onSelect, onToggleChannel, onApprove, onSkip }: ReviewRowProps) {
  const state = reviewState(deal, minScore);
  const best = bestOffer(deal);
  const change = priceChangePercent(deal);
  const selectable = state === "reviewable";

  return (
    <Tr tone={state === "flagged-fake" ? "flag" : state === "out-of-stock" ? "dim" : undefined}>
      <Td>
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-3 size-[18px]"
            checked={selectable && selected}
            disabled={!selectable}
            onChange={(e) => onSelect(e.target.checked)}
            aria-label={`Chọn ${deal.name}`}
          />
          <ProductThumb id={deal.id} />
          <div>
            <b>{deal.name}</b>
            {deal.note && <div className={state === "flagged-fake" ? "text-[13px] text-warn" : "text-[13px] text-muted"}>{deal.note}</div>}
            <div className="mt-1 flex flex-col gap-0.5">
              {deal.offers.map((o) => (
                <div key={o.platform} className={o.platform === best.platform ? "text-[13px] font-medium" : "text-[13px]"}>
                  <PlatformBadge platform={o.platform} /> <span className="tnum">{formatVnd(o.finalPrice)}</span>
                  {!o.inStock && <span className="text-warn"> hết hàng</span>}
                  {o.platform === best.platform && deal.offers.length > 1 && " · rẻ hơn"}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Td>
      <Td className={change < 0 ? "font-medium text-accent-ink tnum" : "font-medium text-warn tnum"}>{formatSignedPercent(change)}</Td>
      <Td>
        {state === "flagged-fake" ? (
          <Badge tone="warn">Giảm ảo</Badge>
        ) : state === "out-of-stock" ? (
          <Badge>Đã loại</Badge>
        ) : (
          <Badge tone={state === "below-score" ? "neutral" : "ok"}>{deal.score}</Badge>
        )}
      </Td>
      <Td className="tnum">{best.commissionRate}%</Td>
      <Td>
        {state === "reviewable" || state === "below-score" ? (
          <div className="flex flex-col gap-1">
            {CHANNELS.map((channel) => {
              const allowed = canPublishTo(deal, channel);
              return (
                <label
                  key={channel}
                  className={allowed ? "flex items-center gap-1.5 text-[13px]" : "flex items-center gap-1.5 text-[13px] opacity-45"}
                  title={allowed ? undefined : "TikTok chỉ gắn được sản phẩm TikTok Shop"}
                >
                  <input
                    type="checkbox"
                    checked={allowed && deal.channels[channel]}
                    disabled={!allowed || disabled}
                    onChange={(e) => onToggleChannel(channel, e.target.checked)}
                  />
                  {CHANNEL_LABEL[channel]}
                </label>
              );
            })}
          </div>
        ) : (
          <span className="text-[13px] text-muted">—</span>
        )}
      </Td>
      <Td>
        {state === "flagged-fake" ? (
          <span className="text-[13px] text-warn">Không bao giờ được đăng</span>
        ) : state === "out-of-stock" ? (
          <span className="text-[13px] text-muted">Tự kiểm tra lại khi quét</span>
        ) : (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="primary"
              disabled={disabled || state === "below-score"}
              title={state === "below-score" ? "Dưới điểm tối thiểu" : undefined}
              onClick={onApprove}
            >
              Duyệt
            </Button>
            <Button size="sm" disabled={disabled} onClick={onSkip}>
              Bỏ
            </Button>
          </div>
        )}
      </Td>
    </Tr>
  );
}
