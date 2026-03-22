import { useRef } from 'react';
import { useInView } from 'framer-motion';

export const useScrollReveal = (threshold = 0.15) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
};
