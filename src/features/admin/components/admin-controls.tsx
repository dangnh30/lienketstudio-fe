"use client";

import { useState } from "react";
import type { Plan } from "@/domain/plan";
import { formatVnd } from "@/shared/lib/format";
import { ActionButton } from "@/shared/ui/action-button";
import { Button } from "@/shared/ui/button";
import { Field, Select, Switch, Textarea } from "@/shared/ui/field";
import { ActionForm, FormInput, FormTextarea, SubmitButton } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";
import { changeCustomerPlanAction, impersonateAction, lockCustomerAction, replyTicketAction, savePlanAction } from "../actions";

export function EditPlanButton({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" className="w-full" onClick={() => setOpen(true)}>
        Sửa gói
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Sửa gói ${plan.name}`} description="Thay đổi áp dụng ngay cho khách đang dùng gói">
        <ActionForm action={savePlanAction} className="grid grid-cols-2 gap-x-3">
          <input type="hidden" name="planId" value={plan.id} />
          <FormInput label="Giá mỗi tháng (₫)" name="price" inputMode="numeric" defaultValue={plan.price} />
          <FormInput label="Sản phẩm theo dõi" name="products" inputMode="numeric" defaultValue={plan.products} />
          <FormInput label="Bài Facebook mỗi ngày" name="fbPostsPerDay" inputMode="numeric" defaultValue={plan.fbPostsPerDay} />
          <FormInput label="Facebook Page" name="pages" inputMode="numeric" defaultValue={plan.pages} />
          <FormInput label="Link rút gọn mỗi tháng" name="links" inputMode="numeric" defaultValue={plan.links} />
          <FormInput label="Thành viên" name="members" inputMode="numeric" defaultValue={plan.members} />
          <label className="col-span-2 flex items-center gap-2.5 text-sm">
            <Switch name="visible" defaultChecked={plan.visible} />
            Hiện trên trang bảng giá
          </label>
          <div className="col-span-2 mt-3 flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <SubmitButton>Lưu gói</SubmitButton>
          </div>
        </ActionForm>
      </Modal>
    </>
  );
}

export function CustomerPlanForm({ customerId, current, plans }: { customerId: string; current: string; plans: Plan[] }) {
  const [value, setValue] = useState(current);
  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <Field label="Gói hiện tại" className="flex-[1_1_180px]">
        <Select value={value} onChange={(e) => setValue(e.target.value)}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}, {p.price ? formatVnd(p.price) : "Miễn phí"}
            </option>
          ))}
        </Select>
      </Field>
      <div className="mb-6">
        <ActionButton disabled={value === current} action={() => changeCustomerPlanAction(customerId, value)}>
          Đổi gói
        </ActionButton>
      </div>
    </div>
  );
}

export function LockCustomerButton({ customerId, name }: { customerId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        Khóa tài khoản
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Khóa tài khoản ${name}`}
        description="Khách không đăng nhập được, hệ thống ngừng đăng bài. Lý do được hiển thị cho khách."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <ActionButton variant="danger" size="md" disabled={reason.trim().length < 3} action={() => lockCustomerAction(customerId, reason)} onSuccess={() => setOpen(false)}>
              Khóa tài khoản
            </ActionButton>
          </>
        }
      >
        <Field label="Lý do khóa">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>
    </>
  );
}

export function ImpersonateButton({ customerId, disabled }: { customerId: string; disabled?: boolean }) {
  return (
    <ActionButton disabled={disabled} title={disabled ? "Tài khoản đang bị khóa" : undefined} action={() => impersonateAction(customerId)}>
      Đăng nhập thay
    </ActionButton>
  );
}

export function ReplyForm({ ticketId, customerName }: { ticketId: string; customerName: string }) {
  return (
    <ActionForm action={replyTicketAction} resetOnSuccess className="flex flex-col gap-2 border-t border-line-2 px-5 py-3.5">
      <input type="hidden" name="ticketId" value={ticketId} />
      <FormTextarea label={<span className="sr-only">Trả lời</span>} name="text" rows={3} placeholder={`Viết câu trả lời cho ${customerName}…`} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] text-muted">Khách nhận qua email và trong Lienket Studio</span>
        <SubmitButton size="sm">Gửi trả lời</SubmitButton>
      </div>
    </ActionForm>
  );
}
