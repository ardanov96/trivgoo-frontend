import {
  ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, Globe,
  Facebook, Instagram, Twitter, Linkedin, CheckCircle, User, Building2, Headphones,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../src/hooks/useLangNavigate'; // ✅ fix missing import

interface FormData   { name: string; email: string; phone: string; subject: string; message: string; }
interface FormErrors { name?: string; email?: string; phone?: string; subject?: string; message?: string; }

const SOCIAL_MEDIA = [
  { id: 1, icon: Facebook,  name: 'Facebook',  link: 'https://facebook.com/trivgoo',           color: 'hover:bg-blue-600' },
  { id: 2, icon: Instagram, name: 'Instagram', link: 'https://instagram.com/trivgoo',           color: 'hover:bg-pink-600' },
  { id: 3, icon: Twitter,   name: 'Twitter',   link: 'https://twitter.com/trivgoo',             color: 'hover:bg-blue-400' },
  { id: 4, icon: Linkedin,  name: 'LinkedIn',  link: 'https://linkedin.com/company/trivgoo',    color: 'hover:bg-blue-700' },
];

const ContactUs: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate(); // ✅ fix

  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted,  setIsSubmitted]  = useState(false);

  // Contact info built inside component so t() is available
  const CONTACT_INFO = [
    { id: 1, icon: Mail,          title: 'Email',       description: t('contact.email_desc',     'Our team responds within 24 hours'), value: 'cs@trivgoo.com',         link: 'mailto:cs@trivgoo.com',         color: 'from-blue-500 to-blue-600'    },
    { id: 2, icon: MessageCircle, title: 'WhatsApp',    description: t('contact.wa_desc',         'Fast response via WhatsApp'),         value: '+62 821-4444-3784',       link: 'https://wa.me/6282144443784',   color: 'from-emerald-500 to-emerald-600' },
    { id: 3, icon: Globe,         title: 'Live Chat',   description: t('contact.chat_desc',       'Available during business hours'),    value: t('contact.start_chat', 'Start chat now'), link: 'https://wa.me/6282144443784', color: 'from-purple-500 to-purple-600' },
  ];

  const OFFICE_LOCATIONS = [
    { id: 1, city: 'Denpasar', country: 'Indonesia', address: 'Jl. Mekar I No.43, Pemogan, Denpasar Selatan, Kota Denpasar, Bali 80221', email: 'cs@trivgoo.com', hours: t('contact.office_hours', 'Mon–Sat: 09:00–18:00 WIB'), isHeadquarters: true },
  ];

  const validateForm = (): boolean => {
    const e: FormErrors = {};
    if (!formData.name.trim())    e.name    = t('contact.name_required',    'Name is required');
    if (!formData.email.trim())   e.email   = t('contact.email_required',   'Email is required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = t('contact.email_invalid', 'Invalid email format');
    if (!formData.phone.trim())   e.phone   = t('contact.phone_required',   'Phone number is required');
    if (!formData.subject.trim()) e.subject = t('contact.subject_required', 'Subject is required');
    if (!formData.message.trim()) e.message = t('contact.message_required', 'Message is required');
    else if (formData.message.trim().length < 10) e.message = t('contact.message_min', 'Message must be at least 10 characters');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => { setFormData({ name:'',email:'',phone:'',subject:'',message:'' }); setIsSubmitted(false); }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}>
        <style>{`
          @keyframes cuGrid  { 0%{background-position:0 0} 100%{background-position:40px 40px} }
          @keyframes cuGlow  { 0%,100%{opacity:.35} 50%{opacity:.65} }
          @keyframes cuScan  { 0%{transform:translateY(0%);opacity:.12} 50%{opacity:.25} 100%{transform:translateY(100%);opacity:.12} }
          @keyframes cuFloat { 0%{opacity:0;transform:translateY(32px)} 100%{opacity:1;transform:translateY(0)} }
          @keyframes cuBadge { 0%{opacity:0;transform:translateY(-12px)} 100%{opacity:1;transform:translateY(0)} }
          .cu-grid{animation:cuGrid 3s linear infinite} .cu-glow1{animation:cuGlow 5s ease-in-out infinite}
          .cu-glow2{animation:cuGlow 7s ease-in-out infinite 2.5s} .cu-glow3{animation:cuGlow 6s ease-in-out infinite 1s}
          .cu-scan{animation:cuScan 4s linear infinite} .cu-back{animation:cuFloat .6s cubic-bezier(.22,1,.36,1) both}
          .cu-badge{animation:cuBadge .6s cubic-bezier(.22,1,.36,1) .1s both} .cu-title{animation:cuFloat .9s cubic-bezier(.22,1,.36,1) .25s both}
          .cu-sub{animation:cuFloat .7s cubic-bezier(.22,1,.36,1) .45s both}
        `}</style>
        <div className="cu-grid absolute inset-0 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)', backgroundSize:'40px 40px' }} />
        <div className="cu-glow1 absolute pointer-events-none rounded-full" style={{ top:'-10%', right:'-5%', width:460, height:460, background:'radial-gradient(circle,rgba(255,200,150,0.18) 0%,transparent 70%)' }} />
        <div className="cu-glow2 absolute pointer-events-none rounded-full" style={{ bottom:'-14%', left:'-7%', width:400, height:400, background:'radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)' }} />
        <div className="cu-scan absolute inset-x-0 pointer-events-none" style={{ height:3, top:0, background:'linear-gradient(90deg,transparent,rgba(255,200,180,0.35),transparent)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to={langPath('/')} className="cu-back inline-flex items-center text-red-200 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">{t('contact.back_home', 'Back to Home')}</span>
          </Link>
          <div className="cu-badge flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Headphones className="w-6 h-6 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">{t('contact.badge', 'Contact Us · Trivgoo')}</span>
          </div>
          <h1 className="cu-title text-4xl md:text-6xl font-serif font-bold mb-5 leading-tight">
            {t('contact.title', 'Contact Us')}
          </h1>
          <p className="cu-sub text-xl text-red-100 max-w-3xl leading-relaxed">
            {t('contact.subtitle', "Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.")}
          </p>
        </div>
      </div>

      {/* ── Contact Cards ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {CONTACT_INFO.map((info) => {
            const Icon = info.icon;
            return (
              <a key={info.id} href={info.link} target={info.link.startsWith('mailto') ? '_self' : '_blank'} rel="noopener noreferrer"
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                <p className="text-primary-600 font-semibold group-hover:text-primary-700">{info.value}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── Form + Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">{t('contact.send_message', 'Send Message')}</h2>
                <p className="text-gray-600">{t('contact.form_desc', 'Fill out the form below and our team will contact you within 24 hours.')}</p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('contact.thank_you', 'Thank You!')}</h3>
                  <p className="text-gray-700">{t('contact.sent_success', 'Your message has been sent successfully. We will contact you soon.')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('contact.name', 'Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('contact.name_placeholder', 'e.g. John Doe')} />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                        {t('auth.email', 'Email')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder={t('auth.email_placeholder', 'you@example.com')} />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                        {t('profile.phone', 'Phone Number')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="e.g. 081234567890" />
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('contact.subject', 'Subject')} <span className="text-red-500">*</span>
                    </label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}>
                      <option value="">{t('contact.select_subject', 'Select subject')}</option>
                      <option value="general">{t('contact.subject_general', 'General Inquiry')}</option>
                      <option value="booking">{t('contact.subject_booking', 'Booking Assistance')}</option>
                      <option value="payment">{t('contact.subject_payment', 'Payment Issue')}</option>
                      <option value="cancellation">{t('contact.subject_cancellation', 'Cancellation & Refund')}</option>
                      <option value="technical">{t('contact.subject_technical', 'Technical Support')}</option>
                      <option value="partnership">{t('contact.subject_partnership', 'Partnership Opportunity')}</option>
                      <option value="feedback">{t('contact.subject_feedback', 'Feedback & Suggestions')}</option>
                      <option value="other">{t('contact.subject_other', 'Other')}</option>
                    </select>
                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                      {t('contact.message', 'Message')} <span className="text-red-500">*</span>
                    </label>
                    <textarea id="message" name="message" rows={6} value={formData.message} onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={t('contact.message_placeholder', 'Tell us more about your inquiry...')} />
                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full text-white py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#a83328,#E05845)' }}>
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common.loading', 'Sending...')}</>
                    ) : (
                      <><Send className="w-5 h-5" />{t('contact.send', 'Send Message')}</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('contact.follow_us', 'Follow Us')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_MEDIA.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a key={s.id} href={s.link} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 p-4 bg-gray-900 text-white rounded-xl transition-all ${s.color} group`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{s.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl p-8 text-white" style={{ background:'linear-gradient(135deg,#6b1a12 0%,#c34134 100%)' }}>
              <h3 className="text-xl font-bold mb-4">{t('contact.need_help', 'Need Quick Help?')}</h3>
              <p className="text-red-100 mb-6">{t('contact.help_desc', 'Visit our help center for instant answers')}</p>
              <Link to={langPath('/help-center')} className="block w-full px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-center hover:bg-gray-50 transition-all">
                {t('contact.visit_help', 'Visit Help Center')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Office Locations ── */}
      <div className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{t('contact.our_office', 'Our Office')}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('contact.visit_us', 'Visit us at our office location')}</p>
          </div>
          <div className="grid gap-8">
            {OFFICE_LOCATIONS.map((office) => (
              <div key={office.id} className="bg-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all relative">
                {office.isHeadquarters && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                      {t('contact.headquarters', 'Headquarters')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary-100 rounded-2xl"><Building2 className="w-6 h-6 text-primary-600" /></div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{office.city}</h3>
                    <p className="text-sm text-gray-600">{office.country}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" /><p className="text-gray-700 text-sm">{office.address}</p></div>
                  <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" /><a href={`mailto:${office.email}`} className="text-gray-700 text-sm hover:text-primary-600">{office.email}</a></div>
                  <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" /><p className="text-gray-700 text-sm">{office.hours}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
