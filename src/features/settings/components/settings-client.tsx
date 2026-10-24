"use client";

import { useState } from "react";
import type { Plan } from "@/domain/plan";
import { formatNumber, formatVnd } from "@/shared/lib/format";
import { ActionButton } from "@/shared/ui/action-button";
import { Button } from "@/shared/ui/button";
import { Field, Input } from "@/shared/ui/field";
import { Modal } from "@/shared/ui/modal";
import { ThemePicker } from "@/shared/ui/theme";
import { useToast } from "@/shared/ui/toast";
import { changePlanAction, requestDeletionAction } from "../actions";

export function AppearancePicker() {
  const toast = useToast();
  return <ThemePicker onChange={(name) => toast(`Đã đổi màu chủ đạo: ${name}`)} />;
}

export function ChangePlanButton({ plans, currentPlanId }: { plans: Plan[]; currentPlanId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentPlanId);
  const visible = plans.filter((p) => p.visible);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Đổi gói
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Đổi gói"
        description="Gói cao hơn áp dụng ngay, phần chênh lệch tính theo số ngày còn lại"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <ActionButton
              variant="primary"
              size="md"
              disabled={selected === currentPlanId}
              action={() => changePlanAction(selected)}
              onSuccess={() => setOpen(false)}
            >
              Xác nhận
            </ActionButton>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Chọn gói</legend>
          {visible.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-3 rounded-sm border border-line p-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-row"
            >
              <input type="radio" name="plan" value={p.id} checked={selected === p.id} onChange={() => setSelected(p.id)} />
              <span className="flex-1">
                <b className="font-medium">{p.name}</b>
                <span className="block text-[13px] text-muted">
                  {formatNumber(p.products)} sản phẩm, {p.fbPostsPerDay} bài Facebook mỗi ngày, {p.pages} Page, {p.members} thành viên
                </span>
              </span>
              <b className="tnum">{p.price ? formatVnd(p.price) : "Miễn phí"}</b>
            </label>
          ))}
        </fieldset>
      </Modal>
    </>
  );
}

export function DeleteWorkspaceButton({ workspaceName }: { workspaceName: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        Xóa workspace
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Xóa workspace"
        description="Toàn bộ dữ liệu bị xóa sau 30 ngày. Trong 30 ngày đó có thể khôi phục."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <ActionButton variant="danger" size="md" disabled={value.trim() !== workspaceName} action={() => requestDeletionAction(value)} onSuccess={() => setOpen(false)}>
              Xóa workspace
            </ActionButton>
          </>
        }
      >
        <Field label={<>Gõ <b>{workspaceName}</b> để xác nhận</>}>
          <Input value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
        </Field>
      </Modal>
    </>
  );
}
