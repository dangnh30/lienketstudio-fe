import type { Metadata } from "next";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { TOKEN_WARNING_DAYS } from "@/domain/accounts";
import { ActionButton, ConfirmActionButton } from "@/shared/ui/action-button";
import { Badge } from "@/shared/ui/badge";
import { Card, Code, InfoRow } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { requireCustomer } from "@/server/auth/dal";
import {
  disconnectAccountAction,
  enableTikTokShopAction,
  removeGroupAction,
  renewAccountAction,
  testAccountAction,
} from "@/features/accounts/actions";
import { AddGroupForm, ConnectButton, PageAutoPostSwitch } from "@/features/accounts/components/account-controls";
import { SubIdTable } from "@/features/accounts/components/sub-id-table";
import { accountService } from "@/features/accounts/server/account.service";

export const metadata: Metadata = { title: "Tài khoản liên kết" };

const LOGOS = {
  meta: { bg: "#1877F2", text: "f" },
  tiktok: { bg: "#111", text: "♪" },
  shopee: { bg: "#EE4D2D", text: "S" },
  accessTrade: { bg: "#0A6CB4", text: "AT" },
} as const;

function AccountCard({ logo, title, subtitle, actions, children }: { logo: keyof typeof LOGOS; title: string; subtitle: ReactNode; actions: ReactNode; children?: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3.5 px-5 py-4">
        <span className="flex size-[38px] flex-none items-center justify-center rounded-sm text-[15px] font-semibold text-white" style={{ background: LOGOS[logo].bg }} aria-hidden="true">
          {LOGOS[logo].text}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px]">{title}</h2>
          <div className="text-[13px] text-muted">{subtitle}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 max-[640px]:w-full">{actions}</div>
      </div>
      {children && <div className="flex flex-col border-t border-line-2 px-5 pt-1.5 pb-4">{children}</div>}
    </Card>
  );
}

const Status = ({ connected, warn }: { connected: boolean; warn?: string }) =>
  connected ? <Badge tone={warn ? "warn" : "ok"}>{warn ?? "Đã kết nối"}</Badge> : <Badge>Chưa kết nối</Badge>;

const Scopes = ({ list }: { list: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {list.map((s) => (
      <Code key={s}>{s}</Code>
    ))}
  </div>
);

export default async function AccountsPage() {
  const { workspaceId } = await requireCustomer();
  const service = accountService();
  const a = await service.get(workspaceId);
  const fbPages = service.facebookPagesForConsent();
  const metaExpiring = a.meta.connected && a.meta.expiresInDays <= TOKEN_WARNING_DAYS;

  return (
    <div className="flex max-w-[980px] flex-col gap-[18px]">
      <PageHeader title="Tài khoản liên kết" description="Tài khoản Facebook, TikTok, Shopee mà hệ thống được dùng để đăng bài và lấy dữ liệu" />

      <h2 className="-mb-1.5 text-[13.5px] font-medium text-muted">Kênh đăng bài</h2>
      {a.meta.connected ? (
        <AccountCard
          logo="meta"
          title="Meta (Facebook)"
          subtitle={`Đăng nhập bằng ${a.meta.user}`}
          actions={
            <>
              <Status connected warn={metaExpiring ? "Sắp hết hạn" : undefined} />
              <ActionButton action={renewAccountAction.bind(null, "meta")}>Làm mới quyền</ActionButton>
              <ConfirmActionButton action={disconnectAccountAction.bind(null, "meta")} confirmLabel="Bấm lần nữa để ngắt">
                Ngắt kết nối
              </ConfirmActionButton>
            </>
          }
        >
          <InfoRow label="Quyền đã cấp">
            <Scopes list={a.meta.scopes} />
          </InfoRow>
          <InfoRow label="Hạn quyền">
            <span className={metaExpiring ? "font-semibold text-warn" : undefined}>Còn {a.meta.expiresInDays} ngày</span>, hệ thống nhắc trước 7 ngày
          </InfoRow>
          <div className="flex flex-col gap-0.5 pt-3.5">
            <div className="mb-1.5 flex justify-between text-[13.5px]">
              <b>Page được phép đăng tự động</b>
              <span className="text-[13px] text-muted">
                {a.meta.pages.filter((p) => p.autoPost).length} / {a.meta.pages.length} Page
              </span>
            </div>
            {a.meta.pages.map((p) => (
              <div key={p.id} className="-mx-2.5 flex items-center gap-3 rounded-sm px-2.5 py-[9px] text-[13.5px] hover:bg-hover">
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[#e8eef9] text-[13px] font-semibold text-[#1f4fa8]">
                  {(p.name.split("] ")[1] ?? p.name).charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <b>{p.name}</b>
                  <span className="block text-[13px] text-muted">{p.followers} người theo dõi</span>
                </span>
                <PageAutoPostSwitch pageId={p.id} name={p.name} autoPost={p.autoPost} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-0.5 pt-3.5">
            <div className="mb-1.5 flex flex-wrap justify-between gap-2 text-[13.5px]">
              <b>Group để đăng tay</b>
              <span className="text-[13px] text-muted">Meta không cho ứng dụng đăng vào Group</span>
            </div>
            {a.meta.groups.map((g) => (
              <div key={g.id} className="-mx-2.5 flex items-center gap-3 rounded-sm px-2.5 py-[9px] text-[13.5px] hover:bg-hover">
                <span className="flex size-8 flex-none items-center justify-center rounded-sm bg-soft text-muted">
                  <Users className="size-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <b>{g.name}</b>
                  <span className="block text-[13px] text-muted">{g.members} thành viên</span>
                </span>
                <ActionButton action={removeGroupAction.bind(null, g.id)}>Gỡ</ActionButton>
              </div>
            ))}
            <AddGroupForm />
          </div>
        </AccountCard>
      ) : (
        <AccountCard
          logo="meta"
          title="Meta (Facebook)"
          subtitle="Kết nối để đăng tự động lên Facebook Page và lưu danh sách Group"
          actions={
            <>
              <Status connected={false} />
              <ConnectButton provider="meta" label="Kết nối Facebook" facebookPages={fbPages} />
            </>
          }
        />
      )}

      {a.tiktok.connected ? (
        <AccountCard
          logo="tiktok"
          title="TikTok"
          subtitle={`Kênh ${a.tiktok.user}, ${a.tiktok.followers} người theo dõi`}
          actions={
            <>
              <Status connected />
              <ActionButton action={renewAccountAction.bind(null, "tiktok")}>Làm mới quyền</ActionButton>
              <ConfirmActionButton action={disconnectAccountAction.bind(null, "tiktok")} confirmLabel="Bấm lần nữa để ngắt">
                Ngắt kết nối
              </ConfirmActionButton>
            </>
          }
        >
          <InfoRow label="Quyền đã cấp">
            <Scopes list={a.tiktok.canUpload ? [...a.tiktok.scopes, "video.upload"] : a.tiktok.scopes} />
          </InfoRow>
          <InfoRow label="Đưa video lên">
            {a.tiktok.canUpload ? "Đẩy vào hộp thư TikTok dưới dạng bản nháp" : <>Tải video về điện thoại rồi đăng, vì ứng dụng chưa được TikTok duyệt <Code>video.upload</Code></>}
          </InfoRow>
          <InfoRow label="Lượt xem video">
            Đọc qua Display API (<Code>video.list</Code>) để hiện ở Thống kê
          </InfoRow>
        </AccountCard>
      ) : (
        <AccountCard
          logo="tiktok"
          title="TikTok"
          subtitle="Kết nối kênh TikTok để đẩy video nháp và đọc lượt xem"
          actions={
            <>
              <Status connected={false} />
              <ConnectButton provider="tiktok" label="Kết nối TikTok" />
            </>
          }
        />
      )}

      <AccountCard
        logo="tiktok"
        title="TikTok Shop Affiliate"
        subtitle={a.tiktokShop.connected ? "Tài khoản nhà sáng tạo đã liên kết" : "Để gắn giỏ hàng, kênh TikTok cần bật tính năng tiếp thị liên kết trong app TikTok"}
        actions={
          <>
            <Status connected={a.tiktokShop.connected} />
            {a.tiktokShop.connected ? (
              <ConfirmActionButton action={disconnectAccountAction.bind(null, "tiktokShop")} confirmLabel="Bấm lần nữa để ngắt">
                Ngắt kết nối
              </ConfirmActionButton>
            ) : (
              <ActionButton action={enableTikTokShopAction}>Đã bật</ActionButton>
            )}
          </>
        }
      >
        {!a.tiktokShop.connected && (
          <ol className="mt-2.5 list-decimal pl-[18px] text-[13.5px] text-ink-2">
            <li>Trong app TikTok: Hồ sơ → Công cụ dành cho nhà sáng tạo → Tiếp thị liên kết TikTok Shop</li>
            <li>Đáp ứng điều kiện của TikTok (số người theo dõi, tuổi tài khoản) và xác minh danh tính</li>
            <li>Quay lại đây bấm &quot;Đã bật&quot; để hệ thống tạo gói video có sản phẩm gắn giỏ hàng</li>
          </ol>
        )}
      </AccountCard>

      <h2 className="-mb-1.5 text-[13.5px] font-medium text-muted">Nguồn sản phẩm và hoa hồng</h2>
      {a.shopee.connected ? (
        <AccountCard
          logo="shopee"
          title="Shopee Affiliate"
          subtitle={`${a.shopee.user}, mã ${a.shopee.affiliateId}`}
          actions={
            <>
              <Status connected />
              <ActionButton action={testAccountAction.bind(null, "shopee")}>Kiểm tra</ActionButton>
              <ConfirmActionButton action={disconnectAccountAction.bind(null, "shopee")} confirmLabel="Bấm lần nữa để ngắt">
                Ngắt kết nối
              </ConfirmActionButton>
            </>
          }
        >
          <InfoRow label="Dùng để">
            Tạo link rút gọn, lấy sản phẩm qua <Code>productOfferV2</Code>, đọc báo cáo đơn và hoa hồng
          </InfoRow>
        </AccountCard>
      ) : (
        <AccountCard
          logo="shopee"
          title="Shopee Affiliate"
          subtitle="Nhập mã từ trang Shopee Affiliate để tạo link và đọc báo cáo"
          actions={
            <>
              <Status connected={false} />
              <ConnectButton provider="shopee" label="Kết nối Shopee" />
            </>
          }
        />
      )}

      {a.accessTrade.connected ? (
        <AccountCard
          logo="accessTrade"
          title="AccessTrade"
          subtitle={`Publisher ${a.accessTrade.publisher}`}
          actions={
            <>
              <Status connected />
              <ActionButton action={testAccountAction.bind(null, "accessTrade")}>Kiểm tra</ActionButton>
              <ConfirmActionButton action={disconnectAccountAction.bind(null, "accessTrade")} confirmLabel="Bấm lần nữa để ngắt">
                Ngắt kết nối
              </ConfirmActionButton>
            </>
          }
        >
          <InfoRow label="Chiến dịch đã tham gia">
            <span className="flex gap-1.5">
              {a.accessTrade.campaigns.map((c) => (
                <Badge key={c} tone={c === "Shopee" ? "shopee" : "tiktok"}>
                  {c}
                </Badge>
              ))}
            </span>
          </InfoRow>
          <InfoRow label="Dùng để">Lấy sản phẩm, mã giảm giá, tạo link TikTok Shop, đọc báo cáo đơn</InfoRow>
        </AccountCard>
      ) : (
        <AccountCard
          logo="accessTrade"
          title="AccessTrade"
          subtitle="Nhập access key của tài khoản publisher"
          actions={
            <>
              <Status connected={false} />
              <ConnectButton provider="accessTrade" label="Kết nối AccessTrade" />
            </>
          }
        />
      )}

      <h2 className="-mb-1.5 text-[13.5px] font-medium text-muted">Mã theo dõi (subId)</h2>
      <SubIdTable />
      <p className="text-[13px] text-muted">
        Mật khẩu tài khoản không bao giờ đi qua Lienket Studio. Facebook và TikTok cấp cho hệ thống một mã truy cập có giới hạn quyền, bạn có
        thể thu hồi bất cứ lúc nào trong phần cài đặt của chính nền tảng đó.
      </p>
    </div>
  );
}
