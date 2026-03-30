import { useState } from 'react';

export interface ContactForm {
  name:  string;
  email: string;
  phone: string;
}

export const useContactForm = (initialEmail = '', initialName = '', initialPhone = '') => {
  const [form,   setForm]   = useState<ContactForm>({ name: initialName, email: initialEmail, phone: initialPhone });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const setField = (field: keyof ContactForm, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<ContactForm> = {};
    if (!form.name.trim())  e.name  = 'Nama wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.phone.trim()) e.phone = 'No. HP wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return { form, errors, setField, validate };
};
