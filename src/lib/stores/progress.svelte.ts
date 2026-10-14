import { load, save } from './storage';

const KEY = 'jhb:heard';
const QUIZ_KEY = 'jhb:quiz';

class Progress {
	heard = $state<Record<string, boolean>>({});
	/** self-check answers: question id → whether the first try was right */
	quiz = $state<Record<string, boolean>>({});

	init() {
		this.heard = load<Record<string, boolean>>(KEY, {});
		this.quiz = load<Record<string, boolean>>(QUIZ_KEY, {});
	}

	answer(id: string, right: boolean) {
		if (id in this.quiz) return;
		this.quiz = { ...this.quiz, [id]: right };
		save(QUIZ_KEY, this.quiz);
	}

	resetQuiz(prefix: string) {
		this.quiz = Object.fromEntries(Object.entries(this.quiz).filter(([k]) => !k.startsWith(prefix)));
		save(QUIZ_KEY, this.quiz);
	}

	toggle(id: string) {
		this.heard = { ...this.heard, [id]: !this.heard[id] };
		save(KEY, this.heard);
	}

	count(prefix: string) {
		return Object.entries(this.heard).filter(([k, v]) => v && k.startsWith(prefix)).length;
	}
}

export const progress = new Progress();
