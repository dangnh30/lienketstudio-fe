import type { Metadata } from "next";
import { ActionButton } from "@/shared/ui/action-button";
import { Badge } from "@/shared/ui/badge";
import { Code, Section } from "@/shared/ui/card";
import { SwitchField } from "@/shared/ui/field";
import { ActionForm, FormInput, FormTextarea, SubmitButton } from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page-header";
import { savePlatformAction, testPlatformKeyAction } from "@/features/admin/actions";
import { getPlatformSettings } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Cài đặt nền tảng" };

type Key = { name: string; value: string; status: string; tone: "ok" | "warn"; note: string };

function KeyList({ keys }: { keys: Key[] }) {
  return (
    <div className="grid grid-cols-[minmax(150px,220px)_1fr_auto] items-center gap-x-4 gap-y-2.5 text-sm max-[640px]:grid-cols-1">
      {keys.map((k) => (
        <div key={k.name} className="contents">
          <div className="min-w-0">
            <b className="font-medium">{k.name}</b>
            <div className="text-[13px] text-muted">{k.note}</div>
          </div>
          <div className="min-w-0">
            <Code>{k.value}</Code>
          </div>
          <div className="flex justify-end gap-1.5">
            <Badge tone={k.tone}>{k.status}</Badge>
            <ActionButton action={testPlatformKeyAction.bind(null, k.name)}>Kiểm tra</ActionButton>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PlatformSettingsPage() {
  const pf = await getPlatformSettings();
  return (
    <ActionForm action={savePlatformAction} className="flex max-w-[980px] flex-col gap-[18px]">
      <PageHeader title="Cài đặt nền tảng" description="Áp dụng cho mọi khách hàng" actions={<SubmitButton>Lưu thay đổi</SubmitButton>} />
      <Section title="Đăng ký">
        <SwitchField name="signupEnabled" defaultChecked={pf.signupEnabled} label="Cho phép đăng ký mới" hint="Tắt khi cần tạm ngừng nhận khách" />
        <SwitchField name="requireEmailVerification" defaultChecked={pf.requireEmailVerification} label="Bắt buộc xác minh email" hint="Chống tài khoản rác" />
        <FormInput label="Số ngày dùng thử" name="trialDays" inputMode="numeric" defaultValue={pf.trialDays} className="max-w-[260px]" />
      </Section>
      <Section title="Thông báo chung" description="Dùng khi sàn đổi chính sách hoặc có sự cố">
        <SwitchField name="broadcastEnabled" defaultChecked={pf.broadcastEnabled} label="Hiện thông báo trên đầu trang của mọi khách hàng" />
        <FormTextarea label="Nội dung" name="broadcast" rows={2} defaultValue={pf.broadcast} />
      </Section>
      <Section title="Bảo trì">
        <SwitchField name="maintenance" defaultChecked={pf.maintenance} label="Bật chế độ bảo trì" hint="Khách hàng không đăng nhập được, worker vẫn quét giá nhưng không đăng bài" />
      </Section>
      <Section
        title="Ứng dụng nền tảng"
        description="Khóa lưu trong kho bí mật của máy chủ, giao diện chỉ hiện 4 ký tự cuối. Khóa AccessTrade và Shopee là của từng khách, khách tự nhập ở Tài khoản liên kết."
      >
        <KeyList
          keys={[
            { name: "Meta App", value: "App ID 8xxxx, secret ••••a71c", status: "Đã qua App Review", tone: "ok", note: "Một ứng dụng dùng chung cho mọi khách kết nối Facebook" },
            { name: "TikTok App", value: "Client key ••••77ae", status: "Chưa duyệt video.upload", tone: "warn", note: "Login Kit, Content Posting API, Display API" },
            { name: "Khóa AI", value: "••••e4d1", status: "Hoạt động", tone: "ok", note: "Viết câu mô tả ngắn cho bài của mọi khách" },
          ]}
        />
      </Section>
      <Section title="Nhận thanh toán">
        <KeyList
          keys={[
            { name: "VietQR", value: "[Ngân hàng] ••••6789", status: "Hoạt động", tone: "ok", note: "Tự đối soát qua webhook ngân hàng" },
            { name: "MoMo", value: "Partner code ••••MOMO", status: "Hoạt động", tone: "ok", note: "Ví MoMo" },
            { name: "VNPay", value: "TMN code ••••VNP1", status: "Hoạt động", tone: "ok", note: "Thẻ ATM nội địa, thẻ quốc tế" },
          ]}
        />
      </Section>
      <Section title="Bảo mật quản trị">
        <SwitchField name="requireAdmin2fa" defaultChecked={pf.requireAdmin2fa} label="Bắt buộc xác minh 2 lớp với quản trị viên" />
        <FormInput label="Tự đăng xuất sau (giờ)" name="adminSessionHours" inputMode="numeric" defaultValue={pf.adminSessionHours} className="max-w-[260px]" />
      </Section>
    </ActionForm>
  );
}
