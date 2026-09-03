export function getDirectionFromText(text: string): "rtl" | "ltr" {
  if (!text) return "rtl";
  const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlPattern.test(text) ? "rtl" : "ltr";
}
