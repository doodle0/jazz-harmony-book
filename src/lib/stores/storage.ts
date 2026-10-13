// localStorage that never throws (private windows, blocked storage, SSR).

export function load<T>(key: string, fallback: T): T {
	try {
		const raw = globalThis.localStorage?.getItem(key);
		return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
	} catch {
		return fallback;
	}
}

export function save(key: string, value: unknown) {
	try {
		globalThis.localStorage?.setItem(key, JSON.stringify(value));
	} catch {
		/* ignore */
	}
}
