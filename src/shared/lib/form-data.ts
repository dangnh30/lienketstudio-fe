/** Chuyển FormData thành object, gom các key lặp (checkbox nhiều giá trị) thành mảng */
export function formDataToObject(formData: FormData, arrayKeys: string[] = []) {
  const out: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    out[key] = arrayKeys.includes(key) ? formData.getAll(key) : formData.get(key);
  }
  return out;
}
