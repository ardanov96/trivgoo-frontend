import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// ── Scroll-reveal ─────────────────────────────────────────────────────────────
export const useReveal = (amount = 0.12) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
};

// ── Application form state ────────────────────────────────────────────────────
export interface ApplicationForm {
  fullName:     string;
  email:        string;
  phone:        string;
  coverLetter:  string;
  portfolioUrl: string;
}

const INITIAL_FORM: ApplicationForm = {
  fullName: '', email: '', phone: '', coverLetter: '', portfolioUrl: '',
};

export const useApplicationForm = () => {
  const [form, setForm] = useState<ApplicationForm>(INITIAL_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => setForm(INITIAL_FORM);

  return { form, handleChange, reset };
};
