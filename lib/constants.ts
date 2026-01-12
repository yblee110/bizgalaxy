export const HOLIDAYS: Record<string, string> = {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-03-01': '삼일절',
    '2026-03-02': '대체공휴일',
    '2026-05-01': '근로자의 날',
    '2026-05-05': '어린이날',
    '2026-05-06': '대체공휴일',
    '2026-05-24': '부처님오신날',
    '2026-05-25': '대체공휴일',
    '2026-06-06': '현충일',
    '2026-08-15': '광복절',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    '2026-10-03': '개천절',
    '2026-10-09': '한글날',
    '2026-12-25': '성탄절',
};

export const MEMBER_COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-pink-500', 'bg-rose-500'
];

// Galaxy Visualization Constants
export const GALAXY_CONFIG = {
    LAYOUT: {
        RADIUS: 400,
        CENTER_X_OFFSET: 96,
        CENTER_Y_OFFSET: 96,
    },
    PLANET: {
        BASE_SIZE: 60,
        SIZE_INCREMENT: 20,
        MIN_FONT_SIZE: 10,
        FONT_SCALE_FACTOR: 0.5,
        BASE_FONT_SIZE: 12,
    },
    ANIMATION: {
        TRANSITION_DURATION: 0.8,
    },
} as const;
