import {
  Award,
  CheckCircle,
  Compass,
  Globe,
  Heart,
  Leaf,
  MapPin,
  Shield,
  Star,
  Target,
  Users,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const stats = [
    { value: '50,000+', label: 'Happy Travelers', icon: Users },
    { value: '1,200+', label: 'Destinations Covered', icon: Globe },
    { value: '95%', label: 'Satisfaction Rate', icon: Star },
    { value: '24/7', label: 'Customer Support', icon: Shield },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passionate Service',
      description: 'We genuinely care about creating unforgettable travel experiences for every customer.',
      color: 'text-red-500 bg-red-50',
    },
    {
      icon: Leaf,
      title: 'Sustainable Travel',
      description: 'Committed to eco-friendly tourism and supporting local communities.',
      color: 'text-green-500 bg-green-50',
    },
    {
      icon: Compass,
      title: 'Authentic Experiences',
      description: 'Going beyond tourist spots to show you the real heart of each destination.',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Your security and comfort are our top priorities throughout your journey.',
      color: 'text-purple-500 bg-purple-50',
    },
  ];

  const team = [
    {
      name: 'Ahmad Wijaya',
      role: 'Founder & CEO',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Former travel journalist with 15+ years exploring Asia.',
    },
    {
      name: 'Maya Sari',
      role: 'Head of Operations',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'Hospitality management expert with luxury resort background.',
    },
    {
      name: 'Budi Santoso',
      role: 'Tech Lead',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
      bio: 'Passionate about building seamless travel technology.',
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Experience Curator',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      bio: 'Local culture expert and master itinerary planner.',
    },
  ];

  const achievements = [
    {
      title: 'Best Travel Platform 2023',
      issuer: 'Travel & Leisure Awards',
      icon: Award,
    },
    {
      title: 'Sustainable Tourism Award',
      issuer: 'ASEAN Tourism Forum',
      icon: Leaf,
    },
    {
      title: 'Top Customer Service',
      issuer: 'Indonesia Travel Awards',
      icon: Star,
    },
    {
      title: 'Innovation Excellence',
      issuer: 'Asia Tech Summit',
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-600/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
              Our Story
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              More Than Just <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-amber-200">
                A Travel Company
              </span>
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
              We're a passionate team of explorers and tech innovators dedicated to transforming how you experience Indonesia & Asia.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Connecting Travelers with Authentic Asian Experiences
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Founded in 2018, Trivgoo started with a simple idea: make extraordinary travel experiences in Indonesia & Asia accessible to everyone. What began as a small team of travel enthusiasts has grown into a platform serving thousands of travelers monthly.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                We believe travel should be enriching, sustainable, and hassle-free. Our mission is to bridge the gap between amazing local experiences and curious travelers, while ensuring every journey contributes positively to local communities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">Verified Local Partners</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">Best Price Guarantee</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">24/7 Support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
                <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl p-8 shadow-xl">
                    <img
                    src="https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80"
                    alt="Padar Island, Indonesia"
                    className="rounded-2xl shadow-lg w-full h-auto"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl w-64">
                        <div className="flex items-center mb-3">
                            <div className="p-2 bg-primary-100 rounded-lg mr-3">
                                <Globe className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">8 Countries</div>
                                <div className="text-sm text-gray-500">Across Southeast Asia</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-primary-100 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              What Drives Us Forward
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              These core principles guide every decision we make and every experience we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-2xl ${value.color.split(' ')[1]} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${value.color.split(' ')[0]}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      {/* <div className="bg-gradient-to-b from-white to-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
              Meet The Team
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Passionate Experts Behind Your Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-primary-600 font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Ready to Explore with Us?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who've discovered the magic of Southeast Asia through our curated experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Start Your Journey
            </Link>
            <Link
              to="/contact-us"
              className="px-8 py-4 bg-primary-800 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-900 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;