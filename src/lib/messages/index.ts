// All UI strings live in one file so i18n (Paraglide) can be added later.
import ko from './ko.json';

export type MessageKey = keyof typeof ko;

export function t(key: MessageKey): string {
	return ko[key] ?? key;
}
