export function getDirectionFromText(text: string): "rtl" | "ltr" {
	if (!text) return "rtl";
	// Detect any RTL script characters (Hebrew, Arabic, etc.)
	// Hebrew: \u0590-\u05FF, Arabic: \u0600-\u06FF, extended Arabic: \u0750-\u077F
	// Arabic Presentation Forms: \uFB50-\uFDFF and \uFE70-\uFEFF
	// Syriac, Thaana, N'Ko are also RTL but omitted for brevity.
	const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
	return rtlPattern.test(text) ? "rtl" : "ltr";
}
