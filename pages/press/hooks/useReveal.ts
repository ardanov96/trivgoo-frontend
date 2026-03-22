import { useRef } from 'react';
import { useInView } from 'framer-motion';

export const useReveal = (amount = 0.12) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
};
