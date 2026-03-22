import { useEffect, useState } from 'react';
import { TYPING_WORDS } from '../constants';

export const useTypewriter = () => {
  const [text, setText]           = useState('');
  const [isDeleting, setDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const currentWord   = TYPING_WORDS[wordIndex % TYPING_WORDS.length];
    const isFullWord    = !isDeleting && text === currentWord;
    const isWordDeleted =  isDeleting && text === '';

    if (isFullWord)    { const t = setTimeout(() => setDeleting(true), 2000); return () => clearTimeout(t); }
    if (isWordDeleted) { setDeleting(false); setWordIndex((p) => p + 1); return; }

    const next = isDeleting
      ? currentWord.substring(0, text.length - 1)
      : currentWord.substring(0, text.length + 1);

    const t = setTimeout(() => setText(next), isDeleting ? 50 : 100);
    return () => clearTimeout(t);
  }, [text, isDeleting, wordIndex]);

  return text;
};
