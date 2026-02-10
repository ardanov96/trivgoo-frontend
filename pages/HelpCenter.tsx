import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen, 
  CreditCard, 
  MapPin, 
  Calendar, 
  Users, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Globe,
  Headphones,
  FileText,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQ[] = [
  // Booking & Payment
  {
    id: 1,
    category: 'Booking & Payment',
    question: 'How do I make a booking on Trivgoo?',
    answer: 'To make a booking, simply search for your desired destination, select your travel dates, choose from our curated experiences, and proceed to checkout. You can pay securely using credit/debit cards, bank transfers, or e-wallets. You will receive a confirmation email immediately after your payment is processed.'
  },
  {
    id: 2,
    category: 'Booking & Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards (Visa, Mastercard, American Express), debit cards, bank transfers, and popular e-wallets including GoPay, OVO, and Dana. All payments are processed securely through our encrypted payment gateway.'
  },
  {
    id: 3,
    category: 'Booking & Payment',
    question: 'Can I modify my booking after confirmation?',
    answer: 'Yes, you can modify your booking depending on the service provider\'s policy. Log into your account, go to "My Bookings," and select the booking you wish to modify. Please note that changes may be subject to availability and additional fees.'
  },
  {
    id: 4,
    category: 'Booking & Payment',
    question: 'Is my payment information secure?',
    answer: 'Absolutely. We use industry-standard SSL encryption and PCI-DSS compliant payment processors to ensure your payment information is fully protected. We never store your complete credit card details on our servers.'
  },
  
  // Cancellation & Refunds
  {
    id: 5,
    category: 'Cancellation & Refunds',
    question: 'What is your cancellation policy?',
    answer: 'Our cancellation policy varies by service provider. Generally: (1) Cancellations 7+ days before departure receive a full refund minus 5% processing fee, (2) 3-7 days before receive 50% refund, (3) Less than 3 days receive no refund. Specific policies are shown at the time of booking.'
  },
  {
    id: 6,
    category: 'Cancellation & Refunds',
    question: 'How do I cancel my booking?',
    answer: 'To cancel a booking, log into your account, navigate to "My Bookings," select the booking you want to cancel, and click "Cancel Booking." Follow the prompts to complete the cancellation. You will receive a confirmation email with refund details if applicable.'
  },
  {
    id: 7,
    category: 'Cancellation & Refunds',
    question: 'How long does it take to receive my refund?',
    answer: 'Refunds are typically processed within 7-14 business days from the cancellation date. The exact timing depends on your payment method and bank. You will receive an email notification once the refund has been initiated.'
  },
  {
    id: 8,
    category: 'Cancellation & Refunds',
    question: 'What happens if the service provider cancels?',
    answer: 'If a service provider cancels your booking, you will receive a full refund with no cancellation fees. We will notify you immediately and help you find alternative options if desired.'
  },
  
  // Account & Profile
  {
    id: 9,
    category: 'Account & Profile',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" in the top right corner, enter your name, email address, and create a password. You can also sign up using your Google or Facebook account for faster registration. Verify your email address to activate your account.'
  },
  {
    id: 10,
    category: 'Account & Profile',
    question: 'I forgot my password. What should I do?',
    answer: 'Click "Login" and then select "Forgot Password." Enter your registered email address, and we will send you a password reset link. Follow the instructions in the email to create a new password.'
  },
  {
    id: 11,
    category: 'Account & Profile',
    question: 'Can I change my email address?',
    answer: 'Yes, you can update your email address in your account settings. Go to "Profile Settings," click "Edit Profile," update your email, and verify the new email address through the confirmation link we send you.'
  },
  {
    id: 12,
    category: 'Account & Profile',
    question: 'How do I delete my account?',
    answer: 'To delete your account, contact our support team at support@trivgoo.com with your account details. Please note that this action is permanent and you will lose access to all your booking history and saved preferences.'
  },
  
  // Travel & Destinations
  {
    id: 13,
    category: 'Travel & Destinations',
    question: 'Do I need travel insurance?',
    answer: 'While travel insurance is not mandatory, we highly recommend it to protect against unforeseen circumstances such as trip cancellations, medical emergencies, or lost luggage. We can help you arrange travel insurance through our partners.'
  },
  {
    id: 14,
    category: 'Travel & Destinations',
    question: 'What documents do I need for international travel?',
    answer: 'For international travel, you typically need a valid passport (with at least 6 months validity), appropriate visas, and any required health certificates or vaccination records. Requirements vary by destination, so please check specific country requirements before booking.'
  },
  {
    id: 15,
    category: 'Travel & Destinations',
    question: 'Can you help with visa applications?',
    answer: 'Yes, we provide visa assistance services for many destinations. Contact our support team with your travel details, and we will guide you through the visa application process and requirements.'
  },
  {
    id: 16,
    category: 'Travel & Destinations',
    question: 'Are airport transfers included in tour packages?',
    answer: 'Airport transfers are included in some tour packages but not all. Check the package details during booking to see what is included. You can also add airport transfer services separately during checkout.'
  },
  
  // Customer Support
  {
    id: 17,
    category: 'Customer Support',
    question: 'How can I contact customer support?',
    answer: 'You can reach our customer support team via email at support@trivgoo.com, phone at +62 812-3456-7890, or live chat on our website. Our support hours are Monday-Friday 9 AM - 6 PM WIB, and Saturday 9 AM - 3 PM WIB.'
  },
  {
    id: 18,
    category: 'Customer Support',
    question: 'Do you have 24/7 support?',
    answer: 'We offer 24/7 emergency support for travelers who are currently on active trips. For general inquiries, our regular support hours are Monday-Friday 9 AM - 6 PM WIB, and Saturday 9 AM - 3 PM WIB.'
  },
  {
    id: 19,
    category: 'Customer Support',
    question: 'What languages does your support team speak?',
    answer: 'Our support team is fluent in English, Indonesian (Bahasa Indonesia), and Mandarin. We can also arrange support in other languages upon request.'
  },
  {
    id: 20,
    category: 'Customer Support',
    question: 'How quickly will I receive a response?',
    answer: 'We aim to respond to all inquiries within 24 hours during business days. For urgent matters or travelers on active trips, we provide immediate assistance through our 24/7 emergency hotline.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: BookOpen },
  { id: 'Booking & Payment', label: 'Booking & Payment', icon: CreditCard },
  { id: 'Cancellation & Refunds', label: 'Cancellation & Refunds', icon: Shield },
  { id: 'Account & Profile', label: 'Account & Profile', icon: Users },
  { id: 'Travel & Destinations', label: 'Travel & Destinations', icon: MapPin },
  { id: 'Customer Support', label: 'Customer Support', icon: Headphones },
];

const CONTACT_OPTIONS = [
  {
    id: 1,
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    action: 'Start Chat',
    color: 'from-blue-500 to-blue-600',
    available: 'Available Now'
  },
  {
    id: 2,
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    action: 'Send Email',
    color: 'from-purple-500 to-purple-600',
    email: 'support@trivgoo.com'
  },
  {
    id: 3,
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak directly with our team',
    action: 'Call Now',
    color: 'from-green-500 to-green-600',
    phone: '+62 812-3456-7890'
  },
  {
    id: 4,
    icon: Globe,
    title: 'WhatsApp',
    description: 'Quick responses via WhatsApp',
    action: 'Message Us',
    color: 'from-emerald-500 to-emerald-600',
    whatsapp: '+62 812-3456-7890'
  }
];

const POPULAR_TOPICS = [
  { icon: Calendar, title: 'How to Book', link: '#' },
  { icon: CreditCard, title: 'Payment Methods', link: '#' },
  { icon: Shield, title: 'Cancellation Policy', link: '#' },
  { icon: MapPin, title: 'Travel Tips', link: '#' },
  { icon: FileText, title: 'Travel Documents', link: '#' },
  { icon: Zap, title: 'Flash Sale Guide', link: '#' },
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Filter FAQs based on search and category
  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-100 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <HelpCircle className="w-8 h-8" />
            </div>
            <span className="text-primary-100 font-bold text-sm uppercase tracking-widest">
              We're Here to Help
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Help Center
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl leading-relaxed mb-12">
            Find answers to common questions or get in touch with our support team.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20 text-lg shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Category Filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* FAQ List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <span className="text-sm text-gray-500 font-semibold">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary-300 transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                        </div>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-6 h-6 text-primary-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or browse our categories above.
                </p>
              </div>
            )}
          </div>

          {/* Contact Support Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Need More Help?</h3>
              </div>
              
              <p className="text-primary-100 mb-6 leading-relaxed">
                Can't find what you're looking for? Our support team is ready to assist you.
              </p>

              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-primary-200" />
                    <span className="font-bold text-sm">Support Hours</span>
                  </div>
                  <p className="text-sm text-primary-100">
                    Mon-Fri: 9 AM - 6 PM WIB<br />
                    Sat: 9 AM - 3 PM WIB
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-primary-200" />
                    <span className="font-bold text-sm">24/7 Emergency</span>
                  </div>
                  <p className="text-sm text-primary-100">
                    For travelers on active trips
                  </p>
                </div>
              </div>

              <Link
                to="/contact"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl"
              >
                Contact Support
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Options Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your preferred way to reach our support team
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{option.description}</p>
                  
                  {option.available && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">
                      {option.available}
                    </span>
                  )}
                  
                  {option.email && (
                    <p className="text-sm text-gray-500 mb-4">{option.email}</p>
                  )}
                  
                  {option.phone && (
                    <p className="text-sm text-gray-500 mb-4">{option.phone}</p>
                  )}
                  
                  {option.whatsapp && (
                    <p className="text-sm text-gray-500 mb-4">{option.whatsapp}</p>
                  )}
                  
                  <button className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
                    {option.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default HelpCenter;
