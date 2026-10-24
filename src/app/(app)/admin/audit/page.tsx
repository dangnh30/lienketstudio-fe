import type { Metadata } from "next";
import type { AuditKind } from "@/domain/platform-admin";
import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { Segment, Segmented } from "@/shared/ui/segmented";
import { Table, TableScroll, Td, Th, Tr } from "@/shared/ui/table";
import { getAudit } from "@/features/admin/server/queries";

export const metadata: Metadata = { title: "Nhật ký" };

const KINDS: { key?: AuditKind; label: string }[] = [
  { label: "Tất cả" },
  { key: "admin", label: "Quản trị viên" },
  { key: "security", label: "Bảo mật" },
  { key: "billing", label: "Thanh toán" },
];

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  const query = await searchParams;
  const kind = KINDS.find((k) => k.key && k.key === query.kind)?.key;
  const entries = await getAudit(kind);

  return (
    <>
      <PageHeader title="Nhật ký" description="Mọi thao tác của quản trị viên và sự kiện bảo mật, giữ 365 ngày, không sửa hay xóa được" />
      <Segmented label="Lọc nhật ký">
        {KINDS.map((k) => (
          <Segment key={k.label} href={k.key ? `/admin/audit?kind=${k.key}` : "/admin/audit"} active={k.key === kind}>
            {k.label}
          </Segment>
        ))}
      </Segmented>
      <Card>
        <TableScroll>
          <Table className="min-w-[820px]">
            <thead>
              <tr>
                <Th>Thời gian</Th>
                <Th>Người thực hiện</Th>
                <Th>Thao tác</Th>
                <Th>Đối tượng</Th>
                <Th>IP</Th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-muted">
                    Không có mục nào.
                  </Td>
                </tr>
              )}
              {entries.map((a) => (
                <Tr key={a.id}>
                  <Td className="text-[13px] whitespace-nowrap tnum">{a.at}</Td>
                  <Td>{a.actor}</Td>
                  <Td>{a.action}</Td>
                  <Td>{a.target}</Td>
                  <Td className="text-[13px] text-muted">{a.ip}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </>
  );
}
