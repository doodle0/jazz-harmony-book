import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { CHAPTERS, chapterBySlug } from '#lib/chapters.ts';
import type { EntryGenerator, PageLoad } from './$types';

const modules = import.meta.glob<{ default: Component }>('/src/content/*.svx');

export const entries: EntryGenerator = () => CHAPTERS.map((c) => ({ chapter: c.slug }));

export const load: PageLoad = async ({ params }) => {
	const info = chapterBySlug(params.chapter);
	const path = info && Object.keys(modules).find((p) => p.includes(`-${info.slug}.svx`));
	if (!info || !path) error(404, '없는 장입니다');
	const mod = await modules[path]();
	const i = CHAPTERS.indexOf(info);
	return { info, content: mod.default, prev: CHAPTERS[i - 1], next: CHAPTERS[i + 1] };
};
