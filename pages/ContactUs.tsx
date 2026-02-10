import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle,
  User,
  Building2,
  Headphones,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const CONTACT_INFO = [
  {
    id: 1,
    icon: Mail,
    title: 'Email Us',
    description: 'Our team will respond within 24 hours',
    value: 'support@trivgoo.com',
    link: 'mailto:support@trivgoo.com',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Quick responses via WhatsApp',
    value: '+62 812-3456-7890',
    link: 'https://wa.me/6281234567890',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 3,
    icon: Globe,
    title: 'Live Chat',
    description: 'Available during business hours',
    value: 'Start chatting now',
    link: '#',
    color: 'from-purple-500 to-purple-600'
  }
];

const OFFICE_LOCATIONS = [
  {
    id: 1,
    city: 'Denpasar',
    country: 'Indonesia',
    address: 'Jl. Mekar I No.43, Pemogan, Denpasar Selatan, Kota Denpasar, Bali 80221',
    email: 'cs@trivgoo.com',
    hours: 'Mon-Sat: 9AM-6PM',
    isHeadquarters: true
  },
];

const SOCIAL_MEDIA = [
  { 
    id: 1, 
    icon: Facebook, 
    name: 'Facebook', 
    link: 'https://facebook.com/trivgoo',
    color: 'hover:bg-blue-600' 
  },
  { 
    id: 2, 
    icon: Instagram, 
    name: 'Instagram', 
    link: 'https://instagram.com/trivgoo',
    color: 'hover:bg-pink-600' 
  },
  { 
    id: 3, 
    icon: Twitter, 
    name: 'Twitter', 
    link: 'https://twitter.com/trivgoo',
    color: 'hover:bg-blue-400' 
  },
  { 
    id: 4, 
    icon: Linkedin, 
    name: 'LinkedIn', 
    link: 'https://linkedin.com/company/trivgoo',
    color: 'hover:bg-blue-700' 
  }
];

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-100 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Headphones className="w-8 h-8" />
            </div>
            <span className="text-primary-100 font-bold text-sm uppercase tracking-widest">
              We're Here for You
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Get in Touch
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Methods Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTACT_INFO.map((info) => {
            const Icon = info.icon;
            return (
              <a
                key={info.id}
                href={info.link}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                <p className="text-primary-600 font-semibold group-hover:text-primary-700">
                  {info.value}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Content - Form and Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  Send us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-700">
                    Your message has been sent successfully. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+62 812-3456-7890"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Assistance</option>
                      <option value="payment">Payment Issues</option>
                      <option value="cancellation">Cancellation & Refunds</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Follow Us */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Us</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_MEDIA.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.id}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 p-4 bg-gray-900 text-white rounded-xl transition-all ${social.color} group`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{social.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Need Quick Help?</h3>
              <p className="text-primary-100 mb-6">
                Check out our comprehensive resources
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/help-center"
                  className="block w-full px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-center hover:bg-gray-50 transition-all"
                >
                  Visit Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Office Locations */}
      <div className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Offices
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Visit us at any of our office locations
            </p>
          </div>

          <div className="grid gap-8">
            {OFFICE_LOCATIONS.map((office) => (
              <div
                key={office.id}
                className="bg-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all relative"
              >
                {office.isHeadquarters && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                      Headquarters
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary-100 rounded-2xl">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{office.city}</h3>
                    <p className="text-sm text-gray-600">{office.country}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{office.address}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <a href={`mailto:${office.email}`} className="text-gray-700 text-sm hover:text-primary-600">
                      {office.email}
                    </a>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{office.hours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      {/* <div className="bg-gray-200 h-96">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Interactive map will be displayed here</p>
          </div>
        </div>
      </div> */}

    </div>
  );
};

export default ContactUs;
