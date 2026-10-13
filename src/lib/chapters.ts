export interface ChapterInfo {
	n: number;
	slug: string;
	title: string;
	short: string;
	emoji: string;
	color: string;
	blurb: string;
}

export const CHAPTERS: ChapterInfo[] = [
	{ n: 1, slug: 'function', title: '기능을 듣는다: 로마 숫자와 ii-V-I', short: '기능을 듣는다', emoji: '🏠', color: 'var(--tomato)', blurb: '코드 이름이 아니라 역할을 듣기' },
	{ n: 2, slug: 'modes', title: '모드와 코드-스케일 체계', short: '모드와 코드-스케일', emoji: '🌈', color: 'var(--mustard)', blurb: '밝기 순으로 줄 세운 일곱 모드' },
	{ n: 3, slug: 'minor-dominant', title: '다이아토닉을 넘어서: 마이너 스케일과 도미넌트 팔레트', short: '마이너와 도미넌트 팔레트', emoji: '🎨', color: 'var(--plum)', blurb: 'V7 하나에 일곱 가지 색' },
	{ n: 4, slug: 'bebop', title: '비밥 스케일과 6th 디미니시드 체계', short: '비밥과 6th 디미니시드', emoji: '🎷', color: 'var(--sky)', blurb: '정박에 코드톤을 붙잡아 두기' },
	{ n: 5, slug: 'standards', title: '스탠다드는 어떻게 만들어지나: ii-V-I과 그 변형', short: '스탠다드의 문법', emoji: '🌳', color: 'var(--leaf)', blurb: '쪼개거나, 바꾸거나' },
	{ n: 6, slug: 'modal', title: '모달 재즈: sus, 펜타토닉, 4도', short: '모달 재즈', emoji: '🌊', color: 'var(--teal)', blurb: '토닉을 맴돌지 않는 음악' },
	{ n: 7, slug: 'workflow', title: '워크플로: 곡 익히기, 분석, 리하모니제이션, 작곡', short: '워크플로', emoji: '🛠️', color: 'var(--mustard)', blurb: '코드 서른 개 → 결정 여덟 개' },
	{ n: 8, slug: 'practice', title: '역할별 연습 루틴', short: '연습 루틴', emoji: '⏱️', color: 'var(--tomato)', blurb: '매일 20분, 12키' },
	{ n: 9, slug: 'reference', title: '빠른 참조', short: '빠른 참조', emoji: '🗂️', color: 'var(--sky)', blurb: '이것만은 기억하자' }
];

export function chapterBySlug(slug: string) {
	return CHAPTERS.find((c) => c.slug === slug);
}
