// Scales as degree lists over a root, with the guide's names, character notes and
// avoid-note rule (a scale note a half step above a chord tone 1, 3 or 5).

import { CHORD_TONES, type Chord } from './chord';
import { degreeInterval, pc, transpose, type Pitch } from './pitch';

export interface ScaleDef {
	id: string;
	name: string;
	degrees: string[];
	/** the note that gives the mode its colour (§2) */
	character?: string;
	/** the chord the scale naturally sits on, as a quality suffix */
	chord: string;
	mood?: string;
}

export const MODES: ScaleDef[] = [
	{ id: 'lydian', name: '리디안', degrees: ['1', '2', '3', '#4', '5', '6', '7'], character: '#4', chord: 'Δ7(♯11)', mood: '가장 밝음, "열린" 느낌' },
	{ id: 'ionian', name: '아이오니안', degrees: ['1', '2', '3', '4', '5', '6', '7'], chord: 'Δ7', mood: '메이저' },
	{ id: 'mixolydian', name: '믹솔리디안', degrees: ['1', '2', '3', '4', '5', '6', 'b7'], character: 'b7', chord: '7', mood: '도미넌트' },
	{ id: 'dorian', name: '도리안', degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'], character: '6', chord: '-7', mood: '마이너, 살짝 밝음' },
	{ id: 'aeolian', name: '에이올리안', degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'], chord: '-7', mood: '내추럴 마이너' },
	{ id: 'phrygian', name: '프리지안', degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], character: 'b2', chord: '-7', mood: '어두움, 스페인풍' },
	{ id: 'locrian', name: '로크리안', degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], character: 'b5', chord: 'ø7', mood: '하프 디미니시드' }
];

export const DOMINANT_SCALES: ScaleDef[] = [
	{ id: 'mixolydian', name: '믹솔리디안', degrees: ['1', '2', '3', '4', '5', '6', 'b7'], chord: '13', mood: '9, 13 — 평범하고 밝은 V7' },
	{ id: 'aeolian-dominant', name: '에이올리안 도미넌트', degrees: ['1', '2', '3', '4', '5', 'b6', 'b7'], chord: '7(♭13)', mood: '9, ♭13 — 마이너 쪽으로 기울어짐' },
	{ id: 'phrygian-dominant', name: '프리지안 도미넌트', degrees: ['1', 'b2', '3', '4', '5', 'b6', 'b7'], chord: '7(♭9, ♭13)', mood: '♭9, ♭13 — 마이너 키 V7의 기본' },
	{ id: 'lydian-dominant', name: '리디안 도미넌트', degrees: ['1', '2', '3', '#4', '5', '6', 'b7'], chord: '7(9, ♯11, 13)', mood: '9, ♯11, 13 — 반짝이는 ♯11' },
	{ id: 'altered', name: '얼터드', degrees: ['1', 'b2', '#2', '3', 'b5', 'b6', 'b7'], chord: '7alt', mood: '♭9, ♯9, ♭5, ♭13 — 최대 긴장' },
	{ id: 'whole-tone', name: '홀톤', degrees: ['1', '2', '3', '#4', '#5', 'b7'], chord: '+7(9, ♯11)', mood: '9, ♯11, ♯5 — 떠다니는 모호함' },
	{ id: 'half-whole', name: '하프-홀 디미니시드', degrees: ['1', 'b2', '#2', '3', '#4', '5', '6', 'b7'], chord: '7(♭9, 13)', mood: '♭9, ♯9, ♯11, 13 — 대칭, 반짝임' }
];

export const SCALES: Record<string, ScaleDef> = Object.fromEntries(
	[...MODES, ...DOMINANT_SCALES].map((s) => [s.id, s])
);

export function scalePitches(root: Pitch, scale: ScaleDef): { degree: string; pitch: Pitch }[] {
	return scale.degrees.map((d) => ({ degree: d, pitch: transpose(root, degreeInterval(d)) }));
}

/** Degrees of `scale` that sit a half step above a chord tone (1, 3, 5) of `chord`. */
export function avoidNotes(chord: Chord, scaleDegrees: string[]): string[] {
	const tones = CHORD_TONES[chord.quality]
		.filter((d) => !/7|6/.test(d))
		.map((d) => pc(transpose(chord.root, degreeInterval(d))));
	return scaleDegrees.filter((d) => {
		const p = pc(transpose(chord.root, degreeInterval(d)));
		return tones.some((t) => (p - t + 12) % 12 === 1);
	});
}

/** A scale run up and back down, one octave, as degree tokens with octave offsets. */
export function scaleRun(scale: ScaleDef): { degree: string; octave: number }[] {
	const up = scale.degrees.map((d) => ({ degree: d, octave: 0 }));
	const top = { degree: '1', octave: 1 };
	return [...up, top, ...[...up].reverse().slice(0, -1)];
}
