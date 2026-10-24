import { TRACKING_SUB_IDS } from "@/domain/accounts";
import { Badge, type BadgeTone } from "@/shared/ui/badge";
import { Card, Code } from "@/shared/ui/card";
import { Table, Td, Th, Tr } from "@/shared/ui/table";

/** subId gắn vào link affiliate để tách đơn theo kênh */
export function SubIdTable() {
  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <Th>Kênh</Th>
            <Th>subId gắn vào link affiliate</Th>
          </tr>
        </thead>
        <tbody>
          {TRACKING_SUB_IDS.map((s) => (
            <Tr key={s.subId}>
              <Td>
                <Badge tone={s.tone as BadgeTone}>{s.channel}</Badge>
              </Td>
              <Td>
                <Code>{s.subId}</Code>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
