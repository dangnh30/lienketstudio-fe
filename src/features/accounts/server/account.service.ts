import "server-only";
import type { AccountKey, ConnectedAccounts } from "@/domain/accounts";
import { ACCOUNT_LABEL } from "@/domain/accounts";
import { DomainError } from "@/shared/lib/action-result";
import { repositories } from "@/server/container";
import type { Repositories } from "@/server/repositories/types";

/** Thông tin trả về sau khi người dùng đồng ý trên trang OAuth của nền tảng (bản mock dựng sẵn) */
const OAUTH_PROFILE = {
  meta: {
    user: "[Tên tài khoản Facebook]",
    scopes: ["pages_show_list", "pages_manage_posts", "pages_read_engagement"],
    pages: [
      { id: "p1", name: "[Page chính] Săn deal tai nghe", followers: "12,4k" },
      { id: "p2", name: "[Page phụ] Góc âm thanh", followers: "3,1k" },
    ],
  },
  tiktok: { user: "@[tên kênh TikTok]", followers: "5,2k", scopes: ["user.info.basic", "video.list"] },
};

export type ConnectInput =
  | { provider: "meta"; pageIds: string[] }
  | { provider: "tiktok" }
  | { provider: "shopee"; affiliateId: string; appId: string; secret: string }
  | { provider: "accessTrade"; accessKey: string };

/**
 * Kết nối / ngắt / làm mới tài khoản bên ngoài.
 * Khoá bí mật (Shopee secret, AccessTrade key) KHÔNG lưu ở đây: bản thật phải mã hoá và
 * gửi sang kho bí mật phía backend, frontend chỉ giữ 4 ký tự cuối để hiển thị.
 */
export class AccountService {
  constructor(private readonly repos: Repositories) {}

  get(workspaceId: string) {
    return this.repos.accounts.get(workspaceId);
  }

  /** Danh sách Page mà Facebook trả về ở bước 2 của OAuth */
  facebookPagesForConsent() {
    return OAUTH_PROFILE.meta.pages;
  }

  private async mutate(workspaceId: string, fn: (a: ConnectedAccounts) => void) {
    const accounts = await this.repos.accounts.get(workspaceId);
    fn(accounts);
    await this.repos.accounts.save(workspaceId, accounts);
    return accounts;
  }

  async connect(workspaceId: string, input: ConnectInput) {
    await this.mutate(workspaceId, (a) => {
      switch (input.provider) {
        case "meta": {
          const pages = OAUTH_PROFILE.meta.pages.map((p) => ({ ...p, autoPost: input.pageIds.includes(p.id) }));
          if (!pages.some((p) => p.autoPost)) throw new DomainError("Chọn ít nhất một Page");
          a.meta = { connected: true, user: OAUTH_PROFILE.meta.user, expiresInDays: 60, scopes: OAUTH_PROFILE.meta.scopes, pages, groups: a.meta.connected ? a.meta.groups : [] };
          break;
        }
        case "tiktok":
          a.tiktok = { connected: true, ...OAUTH_PROFILE.tiktok, canUpload: false };
          break;
        case "shopee":
          a.shopee = { connected: true, user: "[Tên tài khoản Shopee Affiliate]", affiliateId: input.affiliateId };
          break;
        case "accessTrade":
          a.accessTrade = { connected: true, publisher: "[Mã publisher AccessTrade]", campaigns: ["Shopee", "TikTok Shop"] };
          break;
      }
    });
    return ACCOUNT_LABEL[input.provider];
  }

  async disconnect(workspaceId: string, key: AccountKey) {
    await this.mutate(workspaceId, (a) => {
      if (key === "tiktokShop") a.tiktokShop = { connected: false };
      else a[key] = { connected: false };
    });
  }

  async renew(workspaceId: string, key: "meta" | "tiktok") {
    await this.mutate(workspaceId, (a) => {
      if (key === "meta" && a.meta.connected) a.meta.expiresInDays = 60;
      if (!a[key].connected) throw new DomainError(`Chưa kết nối ${ACCOUNT_LABEL[key]}`);
    });
  }

  async enableTikTokShop(workspaceId: string) {
    await this.mutate(workspaceId, (a) => {
      if (!a.tiktok.connected) throw new DomainError("Kết nối kênh TikTok trước");
      a.tiktokShop = { connected: true };
    });
  }

  async setPageAutoPost(workspaceId: string, pageId: string, autoPost: boolean) {
    let name = "";
    await this.mutate(workspaceId, (a) => {
      if (!a.meta.connected) throw new DomainError("Chưa kết nối Facebook");
      const page = a.meta.pages.find((p) => p.id === pageId);
      if (!page) throw new DomainError("Không tìm thấy Page");
      page.autoPost = autoPost;
      name = page.name;
    });
    return name;
  }

  async addGroup(workspaceId: string, url: string) {
    const slug = url.replace(/\/+$/, "").split("/groups/")[1]?.split(/[/?#]/)[0];
    if (!slug) throw new DomainError("Dán link dạng https://facebook.com/groups/...");
    await this.mutate(workspaceId, (a) => {
      if (!a.meta.connected) throw new DomainError("Chưa kết nối Facebook");
      if (a.meta.groups.some((g) => g.id === slug)) throw new DomainError("Group này đã có trong danh sách");
      a.meta.groups.push({ id: slug, name: `[Nhóm] ${slug}`, members: "—" });
    });
  }

  async removeGroup(workspaceId: string, groupId: string) {
    await this.mutate(workspaceId, (a) => {
      if (a.meta.connected) a.meta.groups = a.meta.groups.filter((g) => g.id !== groupId);
    });
  }

  /** Gọi thử API của nền tảng bằng thông tin đã lưu */
  async test(workspaceId: string, key: "shopee" | "accessTrade") {
    const a = await this.repos.accounts.get(workspaceId);
    if (!a[key].connected) throw new DomainError(`Chưa kết nối ${ACCOUNT_LABEL[key]}`);
    return `${ACCOUNT_LABEL[key]}: kết nối thành công`;
  }
}

export const accountService = () => new AccountService(repositories());
