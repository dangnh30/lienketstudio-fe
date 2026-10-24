import { bestOffer, offerOn } from "@/domain/deal";
import { PLATFORM_LABEL } from "@/domain/platform";
import { composePostText } from "@/domain/publishing";
import type { DealFilterSettings } from "@/domain/workspace";
import { formatVnd } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/field";
import { markPostedAction, unscheduleAction } from "../actions";
import type { ScheduleEntry } from "../server/queries";
import { ActionButton, CopyButton } from "@/shared/ui/action-button";
import { FacebookPostPreview } from "./post-preview";

/*
 * Mỗi kênh một panel (Strategy theo kênh): page chọn panel theo tham số [channel].
 */

type PanelProps = { entries: ScheduleEntry[]; settings: DealFilterSettings; postedToday: number };

export function FacebookPagePanel({ entries, settings, postedToday }: PanelProps) {
  const next = entries.find((e) => e.status === "scheduled");
  return (
    <div className="flex flex-wrap items-start gap-4">
      <Card padded className="flex-[1.4_1_420px]">
        <CardHeader title="Đăng tự động hôm nay" action={<span className="text-[13px] text-muted tnum">{postedToday} / {settings.capFbPagePerDay} bài</span>} className="mb-1.5" />
        {entries.length === 0 && <p className="text-muted">Chưa có bài.</p>}
        <ul>
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3 border-t border-line-2 py-2.5">
              <b className="w-[52px] tnum">{e.time}</b>
              <div className="min-w-0 flex-1">
                <b className="font-medium">{e.deal.name}</b>
                <div className="text-[13px] text-muted">
                  {e.status === "posted" ? "Đã đăng qua Pages API" : "Kiểm tra lại giá 5 phút trước giờ đăng"}
                </div>
              </div>
              <Badge tone={e.status === "posted" ? "ok" : "neutral"}>{e.status === "posted" ? "Đã đăng" : "Đã lên lịch"}</Badge>
              {e.status === "scheduled" && <ActionButton action={unscheduleAction.bind(null, e.id)}>Gỡ</ActionButton>}
            </li>
          ))}
        </ul>
      </Card>
      <section className="flex flex-[1_1_320px] flex-col gap-2">
        <h2 className="text-[15px]">Xem trước bài tiếp theo</h2>
        {next ? <FacebookPostPreview deal={next.deal} disclosure={settings.disclosure} /> : <Card padded className="text-muted">Không có bài chờ đăng.</Card>}
      </section>
    </div>
  );
}

export function FacebookGroupPanel({ entries, settings }: PanelProps) {
  return (
    <>
      <p className="text-[13px] text-muted">
        Meta đã gỡ API đăng vào Group, nên bài Group được soạn sẵn để bạn sao chép và dán. Mỗi ngày tối đa{" "}
        {settings.capFbGroupPerDay} bài để tránh bị coi là spam.
      </p>
      {entries.length === 0 && <Card padded className="text-muted">Không có bài soạn sẵn.</Card>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {entries.map((e) => {
          const text = `${composePostText(e.deal, settings.disclosure)}\n\n[Link affiliate ${PLATFORM_LABEL[bestOffer(e.deal).platform]}]`;
          return (
            <Card key={e.id} padded className="flex flex-col gap-2.5">
              <CardHeader title={e.deal.name} action={<Badge tone={e.status === "posted" ? "ok" : "warn"}>{e.status === "posted" ? "Đã đăng" : "Chờ bạn đăng"}</Badge>} />
              <Textarea readOnly rows={7} defaultValue={text} aria-label="Nội dung bài cho Group" className="text-[13.5px]" />
              <div className="flex flex-wrap gap-2">
                <CopyButton text={text} label="Sao chép nội dung" done="Đã sao chép nội dung bài" />
                {e.status !== "posted" && (
                  <ActionButton variant="primary" action={markPostedAction.bind(null, e.id)}>
                    Đã đăng vào Group
                  </ActionButton>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function TikTokPanel({ entries }: PanelProps) {
  return (
    <>
      <Card padded className="border-warn-line bg-warn-row text-[13px]">
        Chưa có quyền <code className="rounded-xs bg-soft px-1.5 font-semibold">video.upload</code> của TikTok: tải video về
        điện thoại rồi đăng.
      </Card>
      {entries.length === 0 && (
        <Card padded className="text-muted">
          Không có gói video. Duyệt deal TikTok Shop và chọn kênh TikTok để tạo gói.
        </Card>
      )}
      {entries.map((e) => {
        const offer = offerOn(e.deal, "tiktokshop");
        if (!offer) return null;
        const change = Math.round(((offer.finalPrice - e.deal.avg30) / e.deal.avg30) * 100);
        const caption = `Deal thật ${change}% so với giá TB 30 ngày, giờ chỉ ${formatVnd(offer.finalPrice)} → bấm giỏ hàng #tainghe #dealthat #tiktokshop`;
        const cheapest = bestOffer(e.deal);
        return (
          <Card key={e.id} padded className="flex flex-wrap gap-[18px]">
            <div className="flex aspect-[9/16] w-[150px] flex-none flex-col justify-between rounded-md bg-gradient-to-b from-[#2a2c31] to-[#111214] p-2.5 text-xs text-white" aria-label="Xem trước video">
              <span className="self-start rounded-[3px] bg-white px-1.5 py-1 text-[13px] font-semibold text-tiktok">{change}%</span>
              <div>
                <div className="opacity-80">[Video 9:16 dựng từ mẫu]</div>
                <b className="text-sm tnum">{formatVnd(offer.finalPrice)}</b>
              </div>
            </div>
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5">
              <CardHeader title={e.deal.name} action={<Badge tone={e.status === "posted" ? "ok" : "warn"}>{e.status === "posted" ? "Đã đăng" : "Chờ bạn đăng"}</Badge>} />
              <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
                Caption và hashtag
                <Textarea readOnly rows={3} defaultValue={caption} className="text-[13.5px]" />
              </label>
              <p className="text-[13px]">
                <b>Sản phẩm cần gắn giỏ hàng:</b> {e.deal.name} · TikTok Shop · hoa hồng {offer.commissionRate}%
              </p>
              {cheapest.platform === "shopee" && (
                <p className="text-[13px] text-warn">
                  Lưu ý: Shopee đang rẻ hơn ({formatVnd(cheapest.finalPrice)}). Video TikTok chỉ gắn được giá TikTok Shop.
                </p>
              )}
              <ol className="m-0 list-decimal pl-[18px] text-[13.5px] text-ink-2">
                <li>Tải video về điện thoại</li>
                <li>Dán caption, bật nhãn nội dung thương mại</li>
                <li>Thêm liên kết → Sản phẩm → chọn sản phẩm trên</li>
                <li>Đăng, rồi quay lại bấm &quot;Đã đăng&quot;</li>
              </ol>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={caption} label="Sao chép caption" done="Đã sao chép caption" />
                {e.status !== "posted" && (
                  <ActionButton variant="primary" action={markPostedAction.bind(null, e.id)}>
                    Đã đăng
                  </ActionButton>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
}
