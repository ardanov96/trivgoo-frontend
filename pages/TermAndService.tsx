import { ArrowLeft, CheckCircle, Shield, FileText, Scale, Lock, AlertCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const TermAndService: React.FC = () => {
  // Smooth scroll function
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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
              <FileText className="w-8 h-8" />
            </div>
            <span className="text-primary-100 font-bold text-sm uppercase tracking-widest">
              Legal Document
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Terms and Service
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl leading-relaxed">
            Please read these terms and conditions carefully before using Trivgoo's services.
          </p>
          
          <div className="mt-8 flex items-center gap-2 text-sm text-primary-100">
            <AlertCircle className="w-4 h-4" />
            <span>Last updated: February 10, 2026</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-4 no-scrollbar">
            <a 
              href="#acceptance" 
              onClick={(e) => scrollToSection(e, 'acceptance')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Acceptance
            </a>
            <a 
              href="#services" 
              onClick={(e) => scrollToSection(e, 'services')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Services
            </a>
            <a 
              href="#user-obligations" 
              onClick={(e) => scrollToSection(e, 'user-obligations')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              User Obligations
            </a>
            <a 
              href="#booking" 
              onClick={(e) => scrollToSection(e, 'booking')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Booking & Payment
            </a>
            <a 
              href="#cancellation" 
              onClick={(e) => scrollToSection(e, 'cancellation')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Cancellation
            </a>
            <a 
              href="#liability" 
              onClick={(e) => scrollToSection(e, 'liability')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Liability
            </a>
            <a 
              href="#privacy" 
              onClick={(e) => scrollToSection(e, 'privacy')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Introduction */}
        <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-3xl p-8 md:p-10 mb-12 border border-primary-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-600 rounded-2xl flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Trivgoo</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Service ("Terms") govern your use of Trivgoo's website, mobile applications, 
                and services. By accessing or using our platform, you agree to be bound by these Terms. 
                If you do not agree to these Terms, please do not use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <section id="acceptance" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Acceptance of Terms</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-4">
              By creating an account, making a booking, or using any of Trivgoo's services, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy.
            </p>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">You must be at least 18 years old to use our services</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">You are responsible for maintaining the confidentiality of your account</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">You agree to provide accurate and complete information</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Services Provided */}
        <section id="services" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Services Provided</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              Trivgoo operates as a travel booking platform connecting travelers with service providers 
              including tours, accommodations, car rentals, and airport transfers across Indonesia and Asia.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  Tour Packages
                </h3>
                <p className="text-sm text-gray-600">Curated travel experiences and guided tours</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  Accommodations
                </h3>
                <p className="text-sm text-gray-600">Hotels, villas, and quality stays</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  Car Rentals
                </h3>
                <p className="text-sm text-gray-600">Vehicle rental services with drivers</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  Airport Transfers
                </h3>
                <p className="text-sm text-gray-600">Pick-up and drop-off services</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-900">
                <strong>Note:</strong> Trivgoo acts as an intermediary. We are not responsible for the 
                actual provision of services, which are performed by third-party vendors.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: User Obligations */}
        <section id="user-obligations" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">User Obligations</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <p className="text-gray-700 leading-relaxed font-semibold">As a user of Trivgoo, you agree to:</p>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">Provide accurate, current, and complete information during registration and booking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">Use the platform only for lawful purposes and in accordance with these Terms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">Not engage in fraudulent activities or attempt to manipulate our systems</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">Respect intellectual property rights of Trivgoo and third parties</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">Not transmit viruses, malware, or any harmful code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">Comply with all applicable local, national, and international laws</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Booking and Payment */}
        <section id="booking" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">4</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Booking and Payment</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Process</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              When you make a booking through Trivgoo, you are entering into a contract with the service 
              provider. All bookings are subject to availability and confirmation.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="border-l-4 border-primary-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-1">Pricing</h4>
                <p className="text-gray-600 text-sm">All prices are displayed in the local currency and include applicable taxes unless otherwise stated. Prices may vary based on dates, availability, and other factors.</p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-1">Payment Methods</h4>
                <p className="text-gray-600 text-sm">We accept various payment methods including credit cards, debit cards, bank transfers, and e-wallets. Payment must be made in full at the time of booking unless otherwise specified.</p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-1">Confirmation</h4>
                <p className="text-gray-600 text-sm">You will receive a booking confirmation via email once your payment is processed. Please review all details carefully and contact us immediately if there are any errors.</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-900">
                <strong>Important:</strong> Bookings are not guaranteed until payment is received and 
                confirmed. We reserve the right to cancel unconfirmed bookings.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Cancellation and Refunds */}
        <section id="cancellation" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">5</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Cancellation and Refunds</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              Cancellation policies vary depending on the service provider and type of booking. 
              Please review the specific cancellation policy before making a booking.
            </p>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">General Cancellation Policy</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold">
                    7+
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">More than 7 days before</h4>
                  <p className="text-sm text-gray-700">Full refund minus processing fee (typically 5%)</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold">
                    3-7
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">3-7 days before</h4>
                  <p className="text-sm text-gray-700">50% refund of total booking amount</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold">
                    &lt;3
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Less than 3 days before</h4>
                  <p className="text-sm text-gray-700">No refund available</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 italic">
              Note: Refunds are processed within 7-14 business days to the original payment method. 
              Some services may have different cancellation terms which will be clearly stated at the time of booking.
            </p>
          </div>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section id="liability" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">6</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Limitation of Liability</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-4">
              Trivgoo acts solely as a platform connecting travelers with service providers. We are not 
              responsible for:
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-primary-600 mt-1">•</span>
                <span>The quality, safety, or legality of services provided by third-party vendors</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-primary-600 mt-1">•</span>
                <span>Any injuries, damages, or losses incurred during your travel</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-primary-600 mt-1">•</span>
                <span>Travel delays, cancellations, or changes made by service providers</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-primary-600 mt-1">•</span>
                <span>Force majeure events including natural disasters, political unrest, or pandemics</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-primary-600 mt-1">•</span>
                <span>Loss or damage to personal belongings during your trip</span>
              </li>
            </ul>
            
            <div className="p-5 bg-gray-900 text-white rounded-xl">
              <div className="flex items-start gap-3">
                <Scale className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  Our maximum liability for any claim arising from your use of Trivgoo services shall 
                  not exceed the total amount paid by you for the specific booking in question.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Privacy and Data Protection */}
        <section id="privacy" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">7</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Privacy and Data Protection</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              We are committed to protecting your privacy and personal information. Our Privacy Policy 
              explains how we collect, use, and safeguard your data.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <Lock className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Data Security</h3>
                <p className="text-sm text-gray-700">We use industry-standard encryption to protect your personal and payment information.</p>
              </div>
              
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <Shield className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Your Rights</h3>
                <p className="text-sm text-gray-700">You have the right to access, update, or delete your personal data at any time.</p>
              </div>
            </div>
            
            <Link 
              to="/privacy-policy" 
              className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Read our full Privacy Policy
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </section>

        {/* Section 8: Changes to Terms */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">8</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Changes to Terms</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed">
              Trivgoo reserves the right to modify these Terms at any time. We will notify users of any 
              significant changes via email or through a notice on our platform. Your continued use of 
              our services after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            If you have any questions or concerns about these Terms and Service, our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-white text-primary-600 rounded-full font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Contact Support
            </Link>
            <Link 
              to="/faq" 
              className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-full font-bold hover:bg-primary-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TermAndService;
