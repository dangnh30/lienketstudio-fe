import type { StatsBreakdowns } from "@/server/repositories/types";

/** Tỷ lệ phân bổ mẫu – lấy theo design/mockup.html */
export const STATS_BREAKDOWNS: StatsBreakdowns = {
  platforms: [
    { key: "shopee", label: "Shopee", commissionShare: 0.47, orderShare: 0.52, avgCommission: 5.8 },
    { key: "tiktokshop", label: "TikTok Shop", commissionShare: 0.53, orderShare: 0.48, avgCommission: 9.6 },
  ],
  hours: [
    { label: "0–6h", weight: 3 },
    { label: "6–9h", weight: 9 },
    { label: "9–12h", weight: 14 },
    { label: "12–14h", weight: 22 },
    { label: "14–17h", weight: 12 },
    { label: "17–19h", weight: 15 },
    { label: "19–22h", weight: 31 },
    { label: "22–24h", weight: 11 },
  ],
  topProducts: [
    { dealId: "a", clickShare: 0.21, orderShare: 0.24, commissionShare: 0.26 },
    { dealId: "g", clickShare: 0.17, orderShare: 0.16, commissionShare: 0.15 },
    { dealId: "h", clickShare: 0.12, orderShare: 0.11, commissionShare: 0.13 },
    { dealId: "c", clickShare: 0.09, orderShare: 0.08, commissionShare: 0.07 },
    { dealId: "b", clickShare: 0.07, orderShare: 0.08, commissionShare: 0.09 },
  ],
  channels: [
    { key: "tiktok", label: "TikTok", postsPerDay: 1.6, commissionShare: 0.41, note: "Đăng tay, gắn giỏ hàng trong app" },
    { key: "fbpage", label: "Facebook Page", postsPerDay: 7.4, commissionShare: 0.34, note: "Đăng tự động" },
    { key: "fbgroup", label: "Facebook Group", postsPerDay: 2.1, commissionShare: 0.18, note: "Đăng tay, sao chép bài soạn sẵn" },
    { key: "site", label: "Trang so sánh giá", postsPerDay: null, commissionShare: 0.07, note: "Trang tĩnh, không đăng bài" },
  ],
  clickSources: [
    { key: "fbpage", label: "Facebook Page", share: 0.58 },
    { key: "fbgroup", label: "Facebook Group", share: 0.21 },
    { key: "site", label: "Trang so sánh giá", share: 0.13 },
    { key: "reshare", label: "Chia sẻ lại qua Zalo, Messenger", share: 0.08 },
  ],
  devices: [
    { key: "android", label: "Điện thoại Android", share: 0.54 },
    { key: "iphone", label: "iPhone", share: 0.31 },
    { key: "desktop", label: "Máy tính", share: 0.13 },
    { key: "tablet", label: "Máy tính bảng", share: 0.02 },
  ],
  regions: [
    { key: "hcm", label: "TP. Hồ Chí Minh", share: 0.34 },
    { key: "hn", label: "Hà Nội", share: 0.27 },
    { key: "dn", label: "Đà Nẵng", share: 0.06 },
    { key: "bd", label: "Bình Dương", share: 0.05 },
    { key: "other", label: "Nơi khác", share: 0.28 },
  ],
  filteredClicks: [
    { label: "Facebook tạo ảnh xem trước", detail: "facebookexternalhit", share: 0.46 },
    { label: "Zalo tạo ảnh xem trước", detail: "Zalo", share: 0.18 },
    { label: "Bấm lặp lại trong 10 giây", detail: "cùng thiết bị", share: 0.21 },
    { label: "Bot tìm kiếm và công cụ quét", detail: "Googlebot, bingbot…", share: 0.15 },
  ],
  funnelPer30Days: {
    tracked: 12480,
    steps: [
      { key: "drop", value: 640 },
      { key: "notFake", value: 512 },
      { key: "inStock", value: 488 },
      { key: "commission", value: 402 },
      { key: "score", value: 96 },
      { key: "approved", value: 61 },
      { key: "posted", value: 58 },
    ],
  },
};
