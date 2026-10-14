// Melodic lines written as scale degrees of the key, so they transpose with it:
// "6 1 3 5 | 4:1 3 2" — tokens are degrees ('b7', '#4'), '^' / '_' prefixes move an
// octave up or down from the octave above the tonic, ':n' sets the length in beats
// (default an 8th), 'r' is a rest and '|' marks bars (for reading only).

import type { Inst, NoteEv } from '#lib/audio/types.ts';
import { degreeInterval, midiAtOrAbove, transpose, type Pitch } from '#lib/theory/pitch.ts';

export interface LineNote {
	beat: number;
	dur: number;
	/** null for a rest */
	midi: number | null;
	pitch: Pitch | null;
	/** degree relative to the key, e.g. 'b7' */
	degree: string | null;
}

/** `base` is the lowest MIDI note the tonic of the middle octave may take. */
export function parseLine(src: string, tonic: Pitch, base = 60): LineNote[] {
	const root = midiAtOrAbove(tonic, base);
	const out: LineNote[] = [];
	let beat = 0;
	for (const tok of src.split(/\s+/).filter((t) => t && t !== '|')) {
		const m = /^([\^_]*)(r|[♭♯b#]*\d+)(?::(\d+(?:\.\d+)?))?$/u.exec(tok);
		if (!m) throw new Error(`Bad line token "${tok}"`);
		const dur = m[3] ? Number(m[3]) : 0.5;
		if (m[2] === 'r') {
			out.push({ beat, dur, midi: null, pitch: null, degree: null });
		} else {
			const octave = [...m[1]].reduce((o, c) => o + (c === '^' ? 1 : -1), 0);
			const iv = degreeInterval(m[2]);
			// '7' sits above the tonic, 'b2' too; degrees never wrap below it
			const midi = root + iv.semis + 12 * octave;
			out.push({ beat, dur, midi, pitch: transpose(tonic, iv), degree: m[2].replace(/♭/g, 'b').replace(/♯/g, '#') });
		}
		beat += dur;
	}
	return out;
}

export function lineLength(line: LineNote[]): number {
	const last = line[line.length - 1];
	return last ? last.beat + last.dur : 0;
}

/** Notes for the sequencer. `gate` shortens each note a little so repeated notes re-strike. */
export function lineEvents(line: LineNote[], inst: Inst, vel = 0.7, offset = 0, gate = 0.92): NoteEv[] {
	return line
		.filter((n) => n.midi !== null)
		.map((n) => ({
			beat: offset + n.beat,
			dur: n.dur * gate,
			inst,
			midi: [n.midi!],
			// a little accent on the beat
			vel: Number.isInteger(n.beat) ? vel : vel * 0.82
		}));
}
