// A tiny synthesized jazz kit: no samples to download, starts instantly.
// Brushes, ride, hi-hat and rim are filtered noise; kick is a pitched sine.

import type { Drum } from './types';

let noise: AudioBuffer | null = null;

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
	if (noise && noise.sampleRate === ctx.sampleRate) return noise;
	const len = ctx.sampleRate;
	noise = ctx.createBuffer(1, len, ctx.sampleRate);
	const d = noise.getChannelData(0);
	for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
	return noise;
}

function burst(
	ctx: BaseAudioContext,
	out: AudioNode,
	t: number,
	o: { type: BiquadFilterType; freq: number; q?: number; attack?: number; decay: number; gain: number; hp?: number }
) {
	const src = ctx.createBufferSource();
	src.buffer = noiseBuffer(ctx);
	const f = ctx.createBiquadFilter();
	f.type = o.type;
	f.frequency.value = o.freq;
	f.Q.value = o.q ?? 1;
	const g = ctx.createGain();
	const a = o.attack ?? 0.001;
	g.gain.setValueAtTime(0.0001, t);
	g.gain.exponentialRampToValueAtTime(o.gain, t + a);
	g.gain.exponentialRampToValueAtTime(0.0001, t + a + o.decay);
	let node: AudioNode = f;
	src.connect(f);
	if (o.hp) {
		const hp = ctx.createBiquadFilter();
		hp.type = 'highpass';
		hp.frequency.value = o.hp;
		f.connect(hp);
		node = hp;
	}
	node.connect(g);
	g.connect(out);
	src.start(t, Math.random() * 0.5);
	src.stop(t + a + o.decay + 0.05);
}

function tone(ctx: BaseAudioContext, out: AudioNode, t: number, type: OscillatorType, f0: number, f1: number, decay: number, gain: number) {
	const osc = ctx.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(f0, t);
	osc.frequency.exponentialRampToValueAtTime(f1, t + decay);
	const g = ctx.createGain();
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
	osc.connect(g);
	g.connect(out);
	osc.start(t);
	osc.stop(t + decay + 0.05);
}

export function playDrum(ctx: BaseAudioContext, out: AudioNode, drum: Drum, t: number, vel: number) {
	const v = Math.max(0.01, vel);
	switch (drum) {
		case 'ride':
			burst(ctx, out, t, { type: 'bandpass', freq: 7200, q: 0.8, decay: 0.9, gain: 0.22 * v, hp: 3500 });
			tone(ctx, out, t, 'triangle', 3150, 3100, 0.5, 0.025 * v);
			break;
		case 'hat':
			burst(ctx, out, t, { type: 'highpass', freq: 7000, decay: 0.05, gain: 0.25 * v });
			break;
		case 'hatFoot':
			burst(ctx, out, t, { type: 'bandpass', freq: 5500, q: 1.5, attack: 0.004, decay: 0.045, gain: 0.3 * v });
			break;
		case 'brush':
			burst(ctx, out, t, { type: 'bandpass', freq: 3200, q: 0.6, attack: 0.03, decay: 0.28, gain: 0.18 * v });
			break;
		case 'shaker':
			burst(ctx, out, t, { type: 'bandpass', freq: 6500, q: 1.2, attack: 0.012, decay: 0.06, gain: 0.25 * v });
			break;
		case 'rim':
			tone(ctx, out, t, 'triangle', 1750, 1600, 0.035, 0.5 * v);
			burst(ctx, out, t, { type: 'bandpass', freq: 2600, q: 3, decay: 0.03, gain: 0.25 * v });
			break;
		case 'snare':
			burst(ctx, out, t, { type: 'bandpass', freq: 1900, q: 0.7, decay: 0.16, gain: 0.35 * v });
			tone(ctx, out, t, 'triangle', 200, 160, 0.08, 0.25 * v);
			break;
		case 'kick':
			tone(ctx, out, t, 'sine', 120, 45, 0.3, 0.9 * v);
			break;
		case 'cowbell':
			tone(ctx, out, t, 'square', 560, 555, 0.18, 0.06 * v);
			tone(ctx, out, t, 'square', 835, 830, 0.18, 0.05 * v);
			break;
	}
}
