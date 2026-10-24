import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/server/auth/dal";
import {
  AppearancePanel,
  BillingPanel,
  FilterPanel,
  GeneralPanel,
  NotifyPanel,
  ScanPanel,
  SystemPanel,
  UsersPanel,
} from "@/features/settings/components/settings-panels";
import { settingsService } from "@/features/settings/server/settings.service";
import { SETTINGS_TABS, type SettingsTab } from "@/features/settings/tabs";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function SettingsPage({ params }: PageProps<"/app/settings/[[...tab]]">) {
  const { tab: segments = [] } = await params;
  const tab = (segments[0] ?? "general") as SettingsTab;
  if (!(tab in SETTINGS_TABS) || segments.length > 1) notFound();
  if (tab === "appearance") return <AppearancePanel />;

  const { workspaceId } = await requireCustomer();
  const data = await settingsService().overview(workspaceId);

  switch (tab) {
    case "general":
      return <GeneralPanel data={data} />;
    case "filter":
      return <FilterPanel data={data} />;
    case "scan":
      return <ScanPanel data={data} />;
    case "notify":
      return <NotifyPanel data={data} />;
    case "users":
      return <UsersPanel data={data} />;
    case "billing":
      return <BillingPanel data={data} />;
    case "system":
      return <SystemPanel data={data} />;
  }
}
