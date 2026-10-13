import { defineConfig } from 'vitest/config';
import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				// .svx chapters are compiled by mdsvex and left to auto-detect
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') || filename.endsWith('.svx') ? undefined : true
			},
			adapter: adapter(),
			// GitHub Pages serves the site from /<repo>; set BASE_PATH=/jazz-harmony-book in CI
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` },
			preprocess: [mdsvex({ extensions: ['.svx'], smartypants: false })],
			extensions: ['.svelte', '.svx']
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
