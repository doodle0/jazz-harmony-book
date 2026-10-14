// Examples: one style + one analysis each (plan §2). Authored in Roman numerals so
// any example can be heard in any key. Widgets read sets of these from data/examples.

import type { Style, Sequence, NoteEv } from '#lib/audio/types.ts';
import { renderGroove, METER } from '#lib/audio/grooves/index.ts';
import { parseProgression, resolveProgression, totalBeats, parseKey, type Key, type ResolvedChord } from '#lib/theory/progression.ts';
import { voiceProgression, voiceStack, type VoiceOptions, type Voicing, type VoicingStyle } from '#lib/theory/voicing.ts';
import type { Inst } from '#lib/audio/types.ts';

export type Status = 'generated' | 'flagged' | 'approved';

export interface Provenance {
	status: Status;
	origin: 'slides' | 'dataset' | 'analyzer' | 'ai' | 'human';
	model?: string;
}

export interface Variant {
	label: string;
	/** Roman numerals in bars: "ii-7 V7 | IΔ7 | %" */
	prog: string;
	note?: string;
}

export interface Example {
	id: string;
	title: string;
	style: Style;
	/** usual key, e.g. 'F' or 'G-' */
	key: string;
	tempo: number;
	/** beats per bar; defaults from the style (waltz = 3) */
	meter?: number;
	era?: string;
	tune?: { title: string; composer?: string; year?: number };
	/** single progression, or several to A/B */
	prog?: string;
	variants?: Record<string, Variant>;
	voicing?: VoicingStyle;
	/** fixed voicing as a degree stack from the bass up, e.g. '1 5 9 13 3 7 ♯11' (overrides `voicing`) */
	stack?: string;
	/** lowest MIDI note for the bottom of `stack` (default C2) */
	stackLow?: number;
	comp?: Inst;
	note?: string;
	provenance: Provenance;
}

export interface ExampleSet {
	concept: string;
	title: string;
	summary?: string;
	examples: Example[];
}

export const STYLE_LABEL: Record<Style, string> = {
	swing: '스윙',
	bebop: '비밥',
	'hard-bop': '하드밥',
	ballad: '발라드',
	waltz: '재즈 왈츠',
	blues: '블루스',
	bossa: '보사노바',
	samba: '삼바',
	latin: '아프로-쿠반',
	modal: '모달',
	smooth: '스무드 재즈',
	funk: '펑크',
	soul: '소울',
	pad: '코드만'
};

export const STYLE_EMOJI: Record<Style, string> = {
	swing: '🎺',
	bebop: '🎷',
	'hard-bop': '🔥',
	ballad: '🌙',
	waltz: '💃',
	blues: '🎸',
	bossa: '🌴',
	samba: '🥁',
	latin: '🪇',
	modal: '🌊',
	smooth: '🌆',
	funk: '🕺',
	soul: '🎙️',
	pad: '🎹'
};

export function meterOf(ex: Pick<Example, 'meter' | 'style'>): number {
	return ex.meter ?? METER[ex.style] ?? 4;
}

export function progOf(ex: Example, variant?: string): string {
	if (variant && ex.variants?.[variant]) return ex.variants[variant].prog;
	if (ex.prog) return ex.prog;
	const first = ex.variants && Object.values(ex.variants)[0];
	if (!first) throw new Error(`Example ${ex.id} has no progression`);
	return first.prog;
}

export interface Arranged {
	chords: ResolvedChord[];
	voicings: Voicing[];
	seq: Sequence;
}

export interface ArrangeOptions {
	key?: Key;
	variant?: string;
	voicing?: VoicingStyle;
	voiceOptions?: VoiceOptions;
	drums?: boolean;
	bass?: boolean;
	style?: Style;
	/** extra notes on top (melody, scale runs) */
	extra?: NoteEv[];
	/** custom voicings per chord (overrides the voicing engine) */
	voicings?: Voicing[];
}

export function arrange(ex: Example, o: ArrangeOptions = {}): Arranged {
	const meter = meterOf(ex);
	const key = o.key ?? parseKey(ex.key);
	const prog = parseProgression(progOf(ex, o.variant), meter);
	const chords = resolveProgression(prog, key);
	const stack = ex.stack?.split(/\s+/).map((d) => d.replace(/♭/g, 'b').replace(/♯/g, '#'));
	const voicings =
		o.voicings ??
		(stack ? chords.map((c) => voiceStack(c.chord, stack, ex.stackLow)) : null) ??
		voiceProgression(chords.map((c) => c.chord), o.voicing ?? ex.voicing ?? 'spread', o.voiceOptions);
	const seq = renderGroove(o.style ?? ex.style, {
		chords,
		voicings,
		beats: totalBeats(prog),
		beatsPerBar: meter,
		drums: o.drums,
		bass: o.bass,
		comp: ex.comp
	});
	if (o.extra) seq.notes.push(...o.extra);
	return { chords, voicings, seq };
}

/** Production builds hide flagged items (plan §7). */
export function visible(examples: Example[]): Example[] {
	return examples.filter((e) => e.provenance.status !== 'flagged');
}

/**
 * Rolls every chord from the second one on: its notes enter one after another, bottom up,
 * `step` beats apart, so the reader hears each note of a chord they first heard as a block.
 */
export function rollAfterFirst(seq: Sequence, chords: ResolvedChord[], step = 0.22): Sequence {
	const from = chords[1]?.start ?? Infinity;
	const notes = seq.notes.flatMap((n) => {
		if (n.beat < from - 1e-6 || n.midi.length < 2 || n.inst === 'bass' || n.inst === 'ebass') return [n];
		return [...n.midi].sort((a, b) => a - b).map((m, i) => ({ ...n, beat: n.beat + i * step, dur: Math.max(0.5, n.dur - i * step), midi: [m] }));
	});
	return { ...seq, notes };
}
