export type Inst = 'piano' | 'bass' | 'guitar' | 'vibes' | 'epiano' | 'organ' | 'ebass' | 'eguitar';
export type Drum = 'ride' | 'hat' | 'hatFoot' | 'kick' | 'snare' | 'backbeat' | 'rim' | 'brush' | 'shaker' | 'cowbell';

export interface NoteEv {
	beat: number;
	dur: number;
	inst: Inst;
	midi: number[];
	/** 0..1 */
	vel: number;
}

export interface DrumEv {
	beat: number;
	drum: Drum;
	vel: number;
}

/** A marker the UI follows, e.g. "chord 3 starts now". */
export interface Mark {
	beat: number;
	index: number;
}

export interface Sequence {
	beats: number;
	beatsPerBar: number;
	/** Position of the off-beat 8th within a beat: 0.5 straight, ~0.64 medium swing */
	swing: number;
	notes: NoteEv[];
	drums: DrumEv[];
	marks: Mark[];
}

export type Style =
	| 'swing'
	| 'bebop'
	| 'hard-bop'
	| 'ballad'
	| 'waltz'
	| 'blues'
	| 'bossa'
	| 'samba'
	| 'latin'
	| 'modal'
	| 'smooth'
	| 'funk'
	| 'soul'
	| 'pad';
