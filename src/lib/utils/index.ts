import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function toDateString(value?: Date | null) {
	if (!value) return undefined;
	return new Date(value).toLocaleDateString();
}

export function getDirectionFromText(text: string): 'rtl' | 'ltr' {
	if (!text) return 'rtl';
	const rtlPattern =
		/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
	return rtlPattern.test(text) ? 'rtl' : 'ltr';
}

export function removeIframes(content: string): string {
	if (!content) return content;
	return content.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
}

export function getDisplayScore(
	score: { fullTime: { home?: number | null; away?: number | null }; halfTime: { home?: number | null; away?: number | null } },
	teamType: 'home' | 'away'
) {
	return score.fullTime[teamType] ?? score.halfTime[teamType] ?? null;
}
