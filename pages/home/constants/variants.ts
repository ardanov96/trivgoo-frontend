import type { Variants } from 'framer-motion';

export const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export const destContainerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const destBubbleVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.5, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 } },
};

export const fadeUpVariants: Variants = {
  hidden:  { y: 40, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: { duration: 0.8 } },
};

export const aiCardVariants = {
  hidden:  { opacity: 0, y: 30, scale: 0.92 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  hover:   { scale: 1.06, y: -12, transition: { duration: 0.35 } },
} as const satisfies Record<string, object>;

export const aiContainerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

export const ctaContainerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

export const ctaLeftVariants: Variants = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export const ctaRightVariants: Variants = {
  hidden:  { opacity: 0, x: 60, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

export const ctaBadgeVariants: Variants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const ctaButtonVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' } }),
};
