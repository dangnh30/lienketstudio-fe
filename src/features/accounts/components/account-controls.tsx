"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { ActionResult } from "@/shared/lib/action-result";
import { Button } from "@/shared/ui/button";
import { Code } from "@/shared/ui/card";
import { Field, Input, Switch } from "@/shared/ui/field";
import { Modal } from "@/shared/ui/modal";
import { useToast } from "@/shared/ui/toast";
import { addGroupAction, connectAccountAction, setPageAutoPostAction } from "../actions";

type Provider = "meta" | "tiktok" | "shopee" | "accessTrade";
type FbPage = { id: string; name: string; followers: string };

const PERMISSIONS: Record<"meta" | "tiktok", [string, string][]> = {
  meta: [
    ["pages_show_list", "Xem danh sách Page bạn quản lý"],
    ["pages_manage_posts", "Đăng bài lên Page bạn chọn"],
    ["pages_read_engagement", "Đọc lượt tương tác của bài"],
  ],
  tiktok: [
    ["user.info.basic", "Tên và ảnh đại diện của kênh"],
    ["video.list", "Đọc lượt xem video để hiện ở Thống kê"],
    ["video.upload", "Đẩy video nháp vào hộp thư TikTok (chỉ có khi ứng dụng được TikTok duyệt)"],
  ],
};

function useSubmit(onDone: () => void) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (fn: () => Promise<ActionResult<unknown>>) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        setErrors({});
        toast(result.message ?? "Đã lưu");
        onDone();
      } else {
        setErrors(result.fieldErrors ?? {});
        if (!result.fieldErrors) toast(result.error);
      }
    });
  return { pending, errors, submit };
}

/** Nút "Kết nối ..." + hộp thoại tương ứng với từng nhà cung cấp */
export function ConnectButton({ provider, label, facebookPages = [] }: { provider: Provider; label: string; facebookPages?: FbPage[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pageIds, setPageIds] = useState<string[]>(facebookPages.slice(0, 1).map((p) => p.id));
  const close = () => {
    setOpen(false);
    setStep(1);
  };
  const { pending, errors, submit } = useSubmit(close);

  const perms = (list: [string, string][]) => (
    <ul className="flex flex-col gap-2">
      {list.map(([code, text]) => (
        <li key={code} className="grid grid-cols-[auto_1fr] items-start gap-2.5 text-[13.5px]">
          <Code>{code}</Code>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );

  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;
  let title = "";
  let description = "";

  if (provider === "meta" && step === 1) {
    title = "Kết nối Facebook";
    description = "Bước 1/2: xem quyền sẽ xin";
    body = (
      <>
        <p className="mb-2.5">
          Bạn sẽ được chuyển sang <b>facebook.com</b> để đăng nhập và đồng ý. Lienket Studio xin các quyền:
        </p>
        {perms(PERMISSIONS.meta)}
        <p className="mt-2.5 text-[13px] text-muted">Không xin quyền đọc tin nhắn, bạn bè hay đăng lên trang cá nhân.</p>
      </>
    );
    footer = (
      <Button variant="primary" onClick={() => setStep(2)}>
        Tiếp tục tới Facebook
      </Button>
    );
  } else if (provider === "meta") {
    title = "Kết nối Facebook";
    description = "Bước 2/2: chọn Page cho phép đăng tự động";
    body = (
      <>
        <p className="mb-2 text-[13px] text-muted">Facebook trả về {facebookPages.length} Page bạn quản lý:</p>
        {facebookPages.map((p) => (
          <label key={p.id} className="-mx-2.5 flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-[9px] hover:bg-hover">
            <span className="flex-1">
              <b>{p.name}</b>
              <span className="block text-[13px] text-muted">{p.followers} người theo dõi</span>
            </span>
            <Switch
              checked={pageIds.includes(p.id)}
              onChange={(e) => setPageIds((ids) => (e.target.checked ? [...ids, p.id] : ids.filter((x) => x !== p.id)))}
            />
          </label>
        ))}
        <span className="text-[13px] font-medium text-danger">{errors.pageIds}</span>
      </>
    );
    footer = (
      <Button variant="primary" disabled={pending} onClick={() => submit(() => connectAccountAction({ provider: "meta", pageIds }))}>
        Hoàn tất
      </Button>
    );
  } else if (provider === "tiktok") {
    title = "Kết nối TikTok";
    description = "Bạn sẽ được chuyển sang tiktok.com để đăng nhập và đồng ý";
    body = (
      <>
        {perms(PERMISSIONS.tiktok)}
        <p className="mt-2.5 text-[13px] text-muted">Gắn giỏ hàng TikTok Shop vẫn làm trong app TikTok, TikTok chưa mở API cho việc này.</p>
      </>
    );
    footer = (
      <Button variant="primary" disabled={pending} onClick={() => submit(() => connectAccountAction({ provider: "tiktok" }))}>
        Tiếp tục tới TikTok
      </Button>
    );
  } else {
    const isShopee = provider === "shopee";
    title = isShopee ? "Kết nối Shopee Affiliate" : "Kết nối AccessTrade";
    description = isShopee ? "Lấy thông tin ở trang Shopee Affiliate → Open API" : "Lấy access key ở trang AccessTrade Publisher → Tài khoản → API";
    body = (
      <form
        id={`connect-${provider}`}
        noValidate
        className="flex flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const get = (k: string) => String(f.get(k) ?? "");
          submit(() =>
            connectAccountAction(
              isShopee
                ? { provider: "shopee", affiliateId: get("affiliateId"), appId: get("appId"), secret: get("secret") }
                : { provider: "accessTrade", accessKey: get("accessKey") },
            ),
          );
        }}
      >
        {isShopee ? (
          <>
            <Field label="Affiliate ID" error={errors.affiliateId}>
              <Input name="affiliateId" autoComplete="off" aria-invalid={!!errors.affiliateId} />
            </Field>
            <Field label="App ID" error={errors.appId}>
              <Input name="appId" inputMode="numeric" autoComplete="off" aria-invalid={!!errors.appId} />
            </Field>
            <Field label="Secret" error={errors.secret}>
              <Input name="secret" type="password" autoComplete="off" aria-invalid={!!errors.secret} />
            </Field>
          </>
        ) : (
          <Field label="Access key" error={errors.accessKey}>
            <Input name="accessKey" type="password" autoComplete="off" aria-invalid={!!errors.accessKey} />
          </Field>
        )}
      </form>
    );
    footer = (
      <Button type="submit" form={`connect-${provider}`} variant="primary" disabled={pending}>
        Kiểm tra và lưu
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        open={open}
        onClose={close}
        title={title}
        description={description}
        footer={
          <>
            <Button onClick={close}>Hủy</Button>
            {footer}
          </>
        }
      >
        {body}
      </Modal>
    </>
  );
}

export function PageAutoPostSwitch({ pageId, name, autoPost }: { pageId: string; name: string; autoPost: boolean }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useOptimistic(autoPost);
  return (
    <Switch
      checked={value}
      disabled={pending}
      aria-label={`Đăng tự động lên ${name}`}
      onChange={(e) => {
        const next = e.target.checked;
        startTransition(async () => {
          setValue(next);
          const r = await setPageAutoPostAction(pageId, next);
          toast(r.ok ? (r.message ?? "Đã lưu") : r.error);
        });
      }}
    />
  );
}

export function AddGroupForm() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <form
      noValidate
      className="mt-2 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const url = String(new FormData(form).get("url") ?? "");
        startTransition(async () => {
          const r = await addGroupAction(url);
          if (r.ok) {
            setError(undefined);
            form.reset();
            toast(r.message ?? "Đã thêm");
          } else setError(r.fieldErrors?._ ?? r.error);
        });
      }}
    >
      <Field label="Thêm Group (dán link nhóm)" error={error} className="flex-[1_1_240px]">
        <Input name="url" placeholder="https://facebook.com/groups/..." aria-invalid={!!error} />
      </Field>
      <Button type="submit" size="sm" disabled={pending} className="mb-6">
        Thêm
      </Button>
    </form>
  );
}
