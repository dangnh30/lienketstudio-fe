import "server-only";
import { memoryRepositories } from "./repositories/memory";
import type { Repositories } from "./repositories/types";

/**
 * Composition root: nơi duy nhất quyết định dùng implementation nào.
 * Khi có backend thật: thêm `apiRepositories` (gọi REST/GraphQL) và chọn theo env DATA_SOURCE.
 */
export function repositories(): Repositories {
  switch (process.env.DATA_SOURCE ?? "memory") {
    case "memory":
      return memoryRepositories;
    default:
      throw new Error(`DATA_SOURCE không hỗ trợ: ${process.env.DATA_SOURCE}`);
  }
}
