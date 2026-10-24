import type { ReactNode } from "react";
import { INVOICE_STATUS } from "@/domain/platform-admin";
import { MEMBER_ROLES } from "@/domain/workspace";
import { formatVnd } from "@/shared/lib/format";
import { ConfirmActionButton, ActionButton } from "@/shared/ui/action-button";
import { Badge } from "@/shared/ui/badge";
import { Banner } from "@/shared/ui/banner";
import { ButtonLink } from "@/shared/ui/button";
import { Card, Code, InfoRow, Section } from "@/shared/ui/card";
import { CheckboxField, FieldGrid } from "@/shared/ui/field";
import { ActionForm, FormInput, FormSelect, FormTextarea, SubmitButton } from "@/shared/ui/form";
import { Meter, MeterGrid } from "@/shared/ui/meter";
import { PageHeader } from "@/shared/ui/page-header";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import {
  addNicheAction,
  cancelDeletionAction,
  inviteMemberAction,
  removeMemberAction,
  saveFilterAction,
  saveGeneralAction,
  saveNotifyAction,
  saveScanAction,
  saveSystemAction,
} from "../actions";
import type { SettingsService } from "../server/settings.service";
import { SETTINGS_DESCRIPTION, SETTINGS_TABS, type SettingsTab } from "../tabs";
import { AppearancePicker, ChangePlanButton, DeleteWorkspaceButton } from "./settings-client";

type Overview = Awaited<ReturnType<SettingsService["overview"]>>;

/** Tiêu đề + nút lưu (nếu có) + thanh tab – đặt trong form để nút "Lưu thay đổi" submit đúng form */
export function SettingsHeader({ tab, withSave = true }: { tab: SettingsTab; withSave?: boolean }) {
  return (
    <>
      <PageHeader title="Cài đặt" description={SETTINGS_DESCRIPTION[tab]} actions={withSave ? <SubmitButton>Lưu thay đổi</SubmitButton> : undefined} />
      <Segmented label="Nhóm cài đặt">
        {(Object.keys(SETTINGS_TABS) as SettingsTab[]).map((t) => (
          <Segment key={t} href={`/app/settings/${t}`} active={t === tab}>
            {SETTINGS_TABS[t]}
          </Segment>
        ))}
      </Segmented>
    </>
  );
}

const Stack = ({ children }: { children: ReactNode }) => <div className="flex max-w-[980px] flex-col gap-[18px]">{children}</div>;

export function GeneralPanel({ data }: { data: Overview }) {
  const { workspace, plan } = data;
  return (
    <Stack>
      <ActionForm action={saveGeneralAction} className="flex flex-col gap-[18px]">
        <SettingsHeader tab="general" />
        <Section title="Thông tin chung">
          <FieldGrid>
            <FormInput label="Tên hệ thống" name="name" defaultValue={workspace.name} />
            <FormSelect label="Múi giờ" name="timezone" defaultValue={workspace.general.timezone} disabled>
              <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
            </FormSelect>
            <FormSelect label="Đơn vị tiền" name="currency" defaultValue={workspace.general.currency} disabled>
              <option value="VND">Đồng (₫)</option>
            </FormSelect>
          </FieldGrid>
        </Section>
        <Section
          title="Ngách sản phẩm"
          description={`Mỗi ngách có bộ lọc và danh sách sản phẩm theo dõi riêng. Gói ${plan.name} chạy tối đa ${plan.niches} ngách cùng lúc.`}
        >
          <div>
            {workspace.niches.map((n) => (
              <div key={n.name} className="flex items-center justify-between gap-3 border-t border-line-2 py-2 first:border-t-0">
                <CheckboxField label={n.name} name="niche" value={n.name} defaultChecked={n.enabled} className="min-h-0 items-center" />
                <Badge tone={n.enabled ? "ok" : "neutral"}>{n.enabled ? "Đang chạy" : "Tạm tắt"}</Badge>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Giờ yên lặng" description="Không đăng bài Facebook Page và không gửi thông báo đẩy trong khung giờ này.">
          <FieldGrid>
            <FormInput label="Không đăng từ" name="quietFrom" type="time" defaultValue={workspace.general.quietFrom} />
            <FormInput label="Đến" name="quietTo" type="time" defaultValue={workspace.general.quietTo} />
          </FieldGrid>
        </Section>
      </ActionForm>
      {/* Form riêng (không lồng form): thêm ngách mới */}
      <Card padded>
        <ActionForm action={addNicheAction} resetOnSuccess className="flex flex-wrap items-end gap-3">
          <FormInput label="Thêm ngách mới" name="name" placeholder="Ví dụ: Phụ kiện điện thoại" className="flex-[1_1_240px]" />
          <SubmitButton variant="default" className="mb-6">
            Thêm ngách
          </SubmitButton>
        </ActionForm>
      </Card>
    </Stack>
  );
}

export function AppearancePanel() {
  return (
    <Stack>
      <SettingsHeader tab="appearance" withSave={false} />
      <Section title="Màu chủ đạo" description="Dùng cho nút chính, mục menu đang chọn và biểu đồ. Áp dụng ngay khi bấm, chỉ đổi trên trình duyệt này.">
        <AppearancePicker />
      </Section>
      <Section title="Màu nhận diện sàn" description="Giữ cố định theo màu của từng sàn để không nhầm với màu chủ đạo.">
        <div className="flex flex-wrap gap-2.5">
          <Badge tone="shopee">Shopee</Badge>
          <Badge tone="tiktok">TikTok Shop</Badge>
          <Badge tone="fb">Facebook</Badge>
        </div>
      </Section>
    </Stack>
  );
}

export function FilterPanel({ data }: { data: Overview }) {
  const s = data.workspace.settings;
  return (
    <Stack>
      <ActionForm action={saveFilterAction} className="flex flex-col gap-[18px]">
        <SettingsHeader tab="filter" />
        <Section title="Bộ lọc deal">
          <FieldGrid>
            <FormInput label="Giảm tối thiểu so với TB 30 ngày (%)" name="minDrop" inputMode="numeric" defaultValue={s.minDrop} />
            <FormInput label="Điểm deal tối thiểu" name="minScore" inputMode="numeric" defaultValue={s.minScore} />
            <FormInput label="Gắn cờ giảm ảo khi giá tăng quá (%, 14 ngày)" name="fakeRise" inputMode="numeric" defaultValue={s.fakeRise} />
            <FormInput label="Hoa hồng tối thiểu (%)" name="minCommission" inputMode="numeric" defaultValue={s.minCommission} />
          </FieldGrid>
        </Section>
        <Section title="Kênh đăng và tuân thủ">
          <FieldGrid>
            <FormInput label="Bài tối đa mỗi ngày · Facebook Page" name="capFbPagePerDay" inputMode="numeric" defaultValue={s.capFbPagePerDay} />
            <FormInput label="Bài tối đa mỗi ngày · Facebook Group" name="capFbGroupPerDay" inputMode="numeric" defaultValue={s.capFbGroupPerDay} />
          </FieldGrid>
          <FormTextarea label="Câu ghi chú tiếp thị liên kết" name="disclosure" rows={2} defaultValue={s.disclosure} />
          <CheckboxField name="verifyBeforePost" defaultChecked={s.verifyBeforePost} label="Kiểm tra lại giá và tồn kho trước khi đăng" hint="Bỏ bài nếu giá lệch quá 2% hoặc hết hàng" />
          <CheckboxField name="manualReview" defaultChecked={s.manualReview} label="Duyệt tay trước khi đăng" hint="Nên bật trong giai đoạn đầu" />
          <CheckboxField name="aiNoClaims" defaultChecked={s.aiNoClaims} label="Không để AI viết công dụng, thông số sản phẩm" hint="AI chỉ dùng số liệu giá từ hệ thống" />
        </Section>
      </ActionForm>
    </Stack>
  );
}

export function ScanPanel({ data }: { data: Overview }) {
  const s = data.workspace.scan;
  return (
    <Stack>
      <ActionForm action={saveScanAction} className="flex flex-col gap-[18px]">
        <SettingsHeader tab="scan" />
        <Section title="Tần suất quét theo tầng" description="Quét càng dày càng tốn lượt gọi API và CPU của máy chủ.">
          <FieldGrid>
            <FormInput label="Hàng nóng" name="hotMinutes" inputMode="numeric" defaultValue={s.hotMinutes} hint="phút một lần · sắp đăng, đang sale" />
            <FormInput label="TikTok Shop" name="tiktokMinutes" inputMode="numeric" defaultValue={s.tiktokMinutes} hint="phút một lần · giá đổi theo livestream" />
            <FormInput label="Hàng thường" name="normalMinutes" inputMode="numeric" defaultValue={s.normalMinutes} hint="phút một lần" />
            <FormInput label="Tải datafeed tìm sản phẩm mới lúc" name="feedAt" type="time" defaultValue={s.feedAt} />
          </FieldGrid>
        </Section>
        <Section title="Giới hạn API">
          <FieldGrid>
            <FormInput label="AccessTrade: số request tối đa mỗi phút" name="accessTradeRatePerMinute" inputMode="numeric" defaultValue={s.accessTradeRatePerMinute} hint="Giới hạn của AccessTrade là 30, nên để dư" />
            <FormInput label="Số lần thử lại khi lỗi" name="retries" inputMode="numeric" defaultValue={s.retries} hint="Chờ tăng dần giữa các lần thử" />
            <FormInput label="Kiểm tra lại giá trước giờ đăng" name="verifyMinutesBeforePost" inputMode="numeric" defaultValue={s.verifyMinutesBeforePost} hint="phút" />
          </FieldGrid>
        </Section>
      </ActionForm>
    </Stack>
  );
}

export function NotifyPanel({ data }: { data: Overview }) {
  const n = data.workspace.notify;
  return (
    <Stack>
      <ActionForm action={saveNotifyAction} className="flex flex-col gap-[18px]">
        <SettingsHeader tab="notify" />
        <Section title="Nhận thông báo qua">
          <CheckboxField name="push" defaultChecked={n.push} label="Thông báo trên trình duyệt" hint="Khi đang mở Lienket Studio" />
          <CheckboxField name="email" defaultChecked={n.email} label="Email" hint="Gửi tới email của chủ hệ thống" />
        </Section>
        <Section title="Báo khi">
          <CheckboxField name="newDeal" defaultChecked={n.newDeal} label="Có deal mới đạt điểm tối thiểu" />
          <CheckboxField name="readyToPost" defaultChecked={n.readyToPost} label="Có gói TikTok hoặc bài Facebook Group chờ bạn đăng" />
          <CheckboxField name="fakeDeal" defaultChecked={n.fakeDeal} label="Phát hiện giảm giá ảo" />
          <CheckboxField name="apiError" defaultChecked={n.apiError} label="API lỗi hoặc vượt giới hạn liên tục" hint="Sau khi đã tự thử lại mà vẫn lỗi" />
          <CheckboxField name="tokenExpiry" defaultChecked={n.tokenExpiry} label="Token sắp hết hạn" hint="Báo trước 7 ngày" />
          <CheckboxField name="dailyDigest" defaultChecked={n.dailyDigest} label="Tổng kết cuối ngày" />
        </Section>
        <Section title="Tổng kết cuối ngày">
          <FieldGrid>
            <FormInput label="Gửi lúc" name="digestAt" type="time" defaultValue={n.digestAt} />
          </FieldGrid>
        </Section>
      </ActionForm>
    </Stack>
  );
}

export function UsersPanel({ data }: { data: Overview }) {
  const { workspace, plan } = data;
  return (
    <Stack>
      <SettingsHeader tab="users" withSave={false} />
      <Card>
        <TableScroll>
          <Table className="min-w-[560px]">
            <thead>
              <tr>
                <Th>Người dùng</Th>
                <Th>Vai trò</Th>
                <Th>Quyền</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {workspace.members.map((m) => (
                <Tr key={m.id}>
                  <Td>
                    <b>{m.name}</b>
                    <div className="text-[13px] text-muted">{m.email}</div>
                  </Td>
                  <Td>
                    <Badge tone={m.role === "owner" ? "ok" : "neutral"}>{MEMBER_ROLES[m.role].label}</Badge>
                  </Td>
                  <Td className="text-[13px] text-muted">{MEMBER_ROLES[m.role].description}</Td>
                  <Td align="right">{m.role !== "owner" && <ActionButton action={removeMemberAction.bind(null, m.id)}>Gỡ</ActionButton>}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
      <Card padded>
        <ActionForm action={inviteMemberAction} resetOnSuccess className="flex flex-col gap-3">
          <h2 className="text-[15px]">Mời người dùng</h2>
          <FieldGrid>
            <FormInput label="Tên" name="name" />
            <FormInput label="Email" name="email" type="email" />
            <FormSelect label="Vai trò" name="role" defaultValue="editor">
              <option value="editor">Biên tập</option>
              <option value="viewer">Chỉ xem</option>
            </FormSelect>
          </FieldGrid>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] text-muted">
              Người được mời nhận email để tự đặt mật khẩu. Gói {plan.name} có tối đa {plan.members} thành viên.
            </span>
            <SubmitButton>Gửi lời mời</SubmitButton>
          </div>
        </ActionForm>
      </Card>
    </Stack>
  );
}

export function BillingPanel({ data }: { data: Overview }) {
  const { workspace, plan, plans, accounts, customer, invoices } = data;
  const autoPages = accounts.meta.connected ? accounts.meta.pages.filter((p) => p.autoPost).length : 0;
  return (
    <Stack>
      <SettingsHeader tab="billing" withSave={false} />
      <Card padded className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[13px] text-muted">Gói hiện tại</div>
          <div className="text-[22px] font-semibold tracking-[-0.02em]">
            {plan.name}{" "}
            <span className="text-[13px] font-normal text-muted">{plan.price ? `${formatVnd(plan.price)} mỗi tháng` : "Miễn phí"}</span>
          </div>
          <div className="text-[13px] text-muted">Gia hạn tự động ngày 03/11/2026 qua VietQR</div>
        </div>
        <ChangePlanButton plans={plans} currentPlanId={plan.id} />
      </Card>
      <Section title="Mức sử dụng" description="Vượt giới hạn thì hệ thống ngừng thêm mới, không xóa dữ liệu">
        <MeterGrid>
          <Meter label="Sản phẩm theo dõi" used={customer?.usage.products ?? 0} limit={plan.products} />
          <Meter label="Facebook Page đăng tự động" used={autoPages} limit={plan.pages} />
          <Meter label="Link rút gọn tháng này" used={customer?.usage.links ?? 0} limit={plan.links} />
          <Meter label="Thành viên" used={workspace.members.length} limit={plan.members} />
          <Meter label="Bài Facebook hôm nay" used={workspace.postedFbPageToday} limit={plan.fbPostsPerDay} />
          <Meter label="Ngách đang chạy" used={workspace.niches.filter((n) => n.enabled).length} limit={plan.niches} />
        </MeterGrid>
      </Section>
      <Card>
        <div className="px-5 pt-[18px] pb-2.5">
          <h2 className="text-[15px]">Hóa đơn</h2>
        </div>
        <TableScroll>
          <Table className="min-w-[560px]">
            <thead>
              <tr>
                <Th>Số</Th>
                <Th>Ngày</Th>
                <Th>Gói</Th>
                <Th align="right">Số tiền</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-muted">
                    Chưa có hóa đơn.
                  </Td>
                </tr>
              )}
              {invoices.map((i) => (
                <Tr key={i.number}>
                  <Td>
                    <Code subtle>{i.number}</Code>
                  </Td>
                  <Td>{i.date}</Td>
                  <Td>{plans.find((p) => p.id === i.planId)?.name}</Td>
                  <Td align="right">{formatVnd(i.amount)}</Td>
                  <Td>
                    <Badge tone={INVOICE_STATUS[i.status].tone}>{INVOICE_STATUS[i.status].label}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
      <Section title="Thông tin xuất hóa đơn">
        <div>
          <InfoRow label="Tên trên hóa đơn">{customer?.name ?? workspace.name}</InfoRow>
          <InfoRow label="Mã số thuế">
            <span className="text-muted">Chưa nhập, cần khi muốn lấy hóa đơn điện tử cho doanh nghiệp</span>
          </InfoRow>
        </div>
      </Section>
    </Stack>
  );
}

export function SystemPanel({ data }: { data: Overview }) {
  const { workspace } = data;
  return (
    <Stack>
      {workspace.deletionRequestedAt && (
        <Banner action={<ConfirmActionButton action={cancelDeletionAction} confirmLabel="Bấm lần nữa để khôi phục">Hủy yêu cầu xóa</ConfirmActionButton>}>
          <b>Workspace đang chờ xóa.</b> Dữ liệu sẽ bị xóa sau 30 ngày kể từ{" "}
          {new Date(workspace.deletionRequestedAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}.
        </Banner>
      )}
      <ActionForm action={saveSystemAction} className="flex flex-col gap-[18px]">
        <SettingsHeader tab="system" />
        <Section title="Trạng thái đăng bài">
          <CheckboxField
            name="paused"
            defaultChecked={workspace.paused}
            label={<b>Tạm dừng toàn bộ đăng bài</b>}
            hint="Dùng khi sàn đổi chính sách hoặc tài khoản có vấn đề. Hệ thống vẫn quét giá bình thường."
          />
        </Section>
      </ActionForm>
      <Section title="Xuất dữ liệu">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex-[1_1_300px] text-[13px]">Tải toàn bộ sản phẩm theo dõi, lịch sử giá, bài đăng và số liệu link dưới dạng CSV.</span>
          <ButtonLink href="/app/export?type=data" size="sm" prefetch={false}>
            Tải dữ liệu
          </ButtonLink>
        </div>
      </Section>
      <Section title="Vùng nguy hiểm" danger>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex-[1_1_300px] text-[13px]">Xóa workspace và toàn bộ dữ liệu sau 30 ngày. Trong 30 ngày đó có thể khôi phục.</span>
          {!workspace.deletionRequestedAt && <DeleteWorkspaceButton workspaceName={workspace.name} />}
        </div>
      </Section>
    </Stack>
  );
}
