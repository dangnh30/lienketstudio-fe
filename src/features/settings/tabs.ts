export const SETTINGS_TABS = {
  general: "Chung",
  appearance: "Giao diện",
  filter: "Bộ lọc và đăng bài",
  scan: "Lịch quét và API",
  notify: "Thông báo",
  users: "Thành viên",
  billing: "Gói và thanh toán",
  system: "Tạm dừng và dữ liệu",
} as const;

export type SettingsTab = keyof typeof SETTINGS_TABS;

export const SETTINGS_DESCRIPTION: Record<SettingsTab, string> = {
  general: "Thông tin chung, ngách sản phẩm và giờ hoạt động",
  appearance: "Màu sắc của Lienket Studio",
  filter: "Bộ lọc deal, giới hạn đăng và tuân thủ",
  scan: "Tần suất quét giá và giới hạn gọi API",
  notify: "Bạn muốn được báo khi nào và qua đâu",
  users: "Ai trong nhóm của bạn được vào workspace này và được làm gì",
  billing: "Gói cước, mức sử dụng và hóa đơn của workspace",
  system: "Tạm dừng đăng bài, xuất dữ liệu và xóa workspace",
};
