export type Role = "customer" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Workspace mặc định của khách hàng; admin không có */
  workspaceId: string | null;
};

/** Dữ liệu tối thiểu được lưu trong cookie phiên (không chứa thông tin nhạy cảm) */
export type SessionPayload = {
  userId: string;
  role: Role;
  /** Admin đang "đăng nhập thay" khách hàng nào (nếu có) */
  impersonating?: string;
};
