import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell, Globe, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-primary-100 font-bold text-sm uppercase tracking-widest">
              Your Privacy Matters
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl leading-relaxed">
            We are committed to protecting your privacy and ensuring the security of your personal information.
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
              href="#information-collected" 
              onClick={(e) => scrollToSection(e, 'information-collected')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Information We Collect
            </a>
            <a 
              href="#how-we-use" 
              onClick={(e) => scrollToSection(e, 'how-we-use')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              How We Use Data
            </a>
            <a 
              href="#data-sharing" 
              onClick={(e) => scrollToSection(e, 'data-sharing')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Data Sharing
            </a>
            <a 
              href="#data-security" 
              onClick={(e) => scrollToSection(e, 'data-security')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Data Security
            </a>
            <a 
              href="#your-rights" 
              onClick={(e) => scrollToSection(e, 'your-rights')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Your Rights
            </a>
            <a 
              href="#cookies" 
              onClick={(e) => scrollToSection(e, 'cookies')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Cookies
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, 'contact')}
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Contact Us
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
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Commitment to You</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Trivgoo, we understand that your privacy is important. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website, mobile application, or use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using Trivgoo, you agree to the collection and use of information in accordance with this policy. 
                We will not use or share your information with anyone except as described in this Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <section id="information-collected" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Information We Collect</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-600" />
                Personal Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Account Registration</h4>
                    <p className="text-sm text-gray-600">Name, email address, phone number, password</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Booking Information</h4>
                    <p className="text-sm text-gray-600">Travel dates, preferences, special requests</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Payment Details</h4>
                    <p className="text-sm text-gray-600">Credit card info, billing address (encrypted)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Communication</h4>
                    <p className="text-sm text-gray-600">Messages, reviews, feedback, support inquiries</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-600" />
                Automatically Collected Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you access our services, we may automatically collect certain information:
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Usage Data:</strong> Pages viewed, time spent, links clicked, search queries</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Location Data:</strong> Approximate location based on IP address or GPS (with permission)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Cookies & Tracking:</strong> See our Cookies section below for more details</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section id="how-we-use" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              We use the information we collect for various purposes, including:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Service Delivery</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To process bookings, manage reservations, send confirmations, and provide customer support. 
                  We share necessary information with service providers to fulfill your travel arrangements.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Account Management</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To create and maintain your account, authenticate your identity, and enable you to access our services.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Personalization</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To understand your preferences and provide personalized recommendations, tailored content, 
                  and relevant offers based on your interests and browsing history.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Communication</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To send you booking confirmations, updates, promotional emails, newsletters, and important service announcements. 
                  You can opt-out of marketing communications at any time.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Platform Improvement</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To analyze usage patterns, conduct research, improve our services, develop new features, 
                  and enhance user experience across our platform.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Security & Fraud Prevention</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To protect against fraudulent activities, detect security threats, monitor for suspicious behavior, 
                  and ensure the safety of our platform and users.
                </p>
              </div>
              
              <div className="border-l-4 border-primary-600 pl-5 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Legal Compliance</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To comply with applicable laws, regulations, legal processes, and government requests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Data Sharing and Disclosure */}
        <section id="data-sharing" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Data Sharing and Disclosure</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              We may share your information with third parties in the following circumstances:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" />
                  Service Providers & Partners
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We share information with hotels, tour operators, transportation providers, and other third-party vendors 
                  necessary to fulfill your bookings. These partners are contractually obligated to protect your data.
                </p>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  Payment Processors
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Payment information is processed through secure, PCI-compliant third-party payment gateways. 
                  We do not store complete credit card details on our servers.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Business Transfers
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                  to the acquiring entity. We will notify you of any such change.
                </p>
              </div>
              
              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Legal Requirements
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We may disclose your information if required by law, court order, legal process, or to protect 
                  the rights, property, or safety of Trivgoo, our users, or the public.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 text-white rounded-xl">
              <p className="text-sm leading-relaxed">
                <strong>Important:</strong> We do not sell your personal information to third parties for their marketing purposes.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Security */}
        <section id="data-security" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">4</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Data Security</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              We implement industry-standard security measures to protect your personal information:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-200">
                <Lock className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Encryption</h3>
                <p className="text-sm text-gray-700">SSL/TLS encryption for data transmission and AES-256 encryption for stored data</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <Shield className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Access Control</h3>
                <p className="text-sm text-gray-700">Strict access controls and authentication protocols for our systems</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <Database className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Regular Backups</h3>
                <p className="text-sm text-gray-700">Automated backups and disaster recovery procedures</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
                <AlertCircle className="w-8 h-8 text-orange-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Monitoring</h3>
                <p className="text-sm text-gray-700">24/7 security monitoring and threat detection systems</p>
              </div>
            </div>
            
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>Note:</strong> While we strive to protect your personal information, no method of transmission 
                over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, 
                but we continuously work to enhance our security measures.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Your Rights */}
        <section id="your-rights" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">5</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Your Privacy Rights</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              You have the following rights regarding your personal information:
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Right to Access</h4>
                  <p className="text-sm text-gray-700">Request a copy of the personal information we hold about you</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Right to Rectification</h4>
                  <p className="text-sm text-gray-700">Correct any inaccurate or incomplete personal information</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Right to Deletion</h4>
                  <p className="text-sm text-gray-700">Request deletion of your personal data (subject to legal requirements)</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Right to Object</h4>
                  <p className="text-sm text-gray-700">Opt-out of marketing communications or data processing for certain purposes</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Right to Data Portability</h4>
                  <p className="text-sm text-gray-700">Receive your data in a structured, commonly used format</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gray-900 text-white rounded-xl">
              <p className="text-sm leading-relaxed mb-3">
                To exercise any of these rights, please contact us at <strong>privacy@trivgoo.com</strong>
              </p>
              <p className="text-sm text-gray-300">
                We will respond to your request within 30 days. You may need to verify your identity before we process your request.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Cookies and Tracking */}
        <section id="cookies" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">6</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Cookies and Tracking Technologies</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              We use cookies and similar tracking technologies to enhance your experience on our platform:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-sm text-gray-700 mb-2">Required for basic site functionality, authentication, and security.</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Always Active</span>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-sm text-gray-700 mb-2">Help us understand how visitors interact with our website.</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Optional</span>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">Marketing Cookies</h3>
                <p className="text-sm text-gray-700 mb-2">Used to track visitors across websites and display relevant advertisements.</p>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">Optional</span>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">Preference Cookies</h3>
                <p className="text-sm text-gray-700 mb-2">Remember your settings and preferences for a personalized experience.</p>
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">Optional</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 italic">
              You can manage your cookie preferences through your browser settings or our cookie consent banner. 
              Note that disabling certain cookies may affect the functionality of our services.
            </p>
          </div>
        </section>

        {/* Section 7: Contact Information */}
        <section id="contact" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold">7</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Contact Us</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="font-bold text-gray-900 mb-3">Email</h3>
                <a href="mailto:privacy@trivgoo.com" className="text-primary-600 hover:text-primary-700 font-semibold">
                  privacy@trivgoo.com
                </a>
              </div>
              
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="font-bold text-gray-900 mb-3">Data Protection Officer</h3>
                <a href="mailto:dpo@trivgoo.com" className="text-primary-600 hover:text-primary-700 font-semibold">
                  dpo@trivgoo.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Have Questions?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help. If you need clarification on any aspect of our privacy practices, 
            don't hesitate to reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-white text-primary-600 rounded-full font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Contact Privacy Team
            </Link>
            <Link 
              to="/terms" 
              className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-full font-bold hover:bg-primary-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              View Terms of Service
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;
