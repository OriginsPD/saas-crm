import type { Variants } from "motion/react";

/** Editorial ease — gpt-taste default for landing motion */
export const editorialEase = [0.22, 1, 0.36, 1] as const;

export const heroStaggerVariants: Variants = {
	hidden: {},
	show: {
		transition: { staggerChildren: 0.12 },
	},
};

export const heroItemVariants: Variants = {
	hidden: { opacity: 0, y: 28 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.85, ease: editorialEase },
	},
};

export { useReducedMotion } from "motion/react";
