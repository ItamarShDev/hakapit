export function toDateString(value?: string) {
	return value && new Date(Date.parse(value)).toLocaleDateString();
}

export function toDate(value?: string) {
	return value ? new Date(Date.parse(value)) : null;
}
