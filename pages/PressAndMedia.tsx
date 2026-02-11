import {
  ArrowRight,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Film,
  Globe,
  Image,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  Phone,
  Quote,
  Star,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface PressRelease {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: 'Announcement' | 'Partnership' | 'Award' | 'Expansion';
  downloadUrl: string;
  isNew?: boolean;
}

interface MediaAsset {
  id: number;
  type: 'image' | 'video' | 'logo' | 'press-kit';
  title: string;
  description: string;
  thumbnail: string;
  downloadUrl: string;
  format: string;
  size: string;
}

interface PressCoverage {
  id: number;
  outlet: string;
  logo: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  type: 'Article' | 'Interview' | 'Review' | 'Feature';
}

const PressAndMedia: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const pressReleases: PressRelease[] = [
    {
      id: 1,
      title: 'Trivgoo Raises $15M Series B to Expand Across Southeast Asia',
      summary: 'Funding round led by Sequoia Capital to accelerate growth and technology development in the travel sector.',
      date: '2024-03-15',
      category: 'Announcement',
      downloadUrl: '#',
      isNew: true,
    },
    {
      id: 2,
      title: 'Partnership with Indonesia Tourism Board to Promote Sustainable Travel',
      summary: 'Collaboration aims to showcase eco-friendly destinations and support local communities.',
      date: '2024-03-10',
      category: 'Partnership',
      downloadUrl: '#',
    },
    {
      id: 3,
      title: 'Trivgoo Wins "Best Travel Innovation" at Asia Tech Awards 2024',
      summary: 'Recognition for AI-powered trip planning technology that personalizes travel experiences.',
      date: '2024-02-28',
      category: 'Award',
      downloadUrl: '#',
    },
    {
      id: 4,
      title: 'Expansion to Vietnam and Thailand Markets Announced',
      summary: 'New offices opening in Hanoi and Bangkok to serve growing demand in Southeast Asia.',
      date: '2024-02-15',
      category: 'Expansion',
      downloadUrl: '#',
    },
    {
      id: 5,
      title: 'Launch of Carbon-Neutral Travel Initiative',
      summary: 'New program allows travelers to offset their carbon footprint through verified projects.',
      date: '2024-02-05',
      category: 'Announcement',
      downloadUrl: '#',
    },
    {
      id: 6,
      title: 'Partnership with Singapore Airlines for Integrated Booking',
      summary: 'Strategic collaboration to offer seamless flight and experience bookings.',
      date: '2024-01-22',
      category: 'Partnership',
      downloadUrl: '#',
    },
  ];

  const mediaAssets: MediaAsset[] = [
    {
      id: 1,
      type: 'logo',
      title: 'Trivgoo Logo Package',
      description: 'Full logo set in various formats and color variations',
      thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'ZIP (SVG, PNG, EPS)',
      size: '45 MB',
    },
    {
      id: 2,
      type: 'image',
      title: 'Brand Photography',
      description: 'High-resolution images of destinations and team',
      thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'ZIP (JPG, PNG)',
      size: '2.3 GB',
    },
    {
      id: 3,
      type: 'video',
      title: 'Brand Story Video',
      description: 'Company overview and mission statement video',
      thumbnail: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'MP4 (4K, 1080p)',
      size: '1.8 GB',
    },
    {
      id: 4,
      type: 'press-kit',
      title: 'Complete Press Kit',
      description: 'All media assets and company information',
      thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'PDF + ZIP',
      size: '3.2 GB',
    },
    {
      id: 5,
      type: 'image',
      title: 'Executive Team Portraits',
      description: 'Professional photos of leadership team',
      thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'JPG',
      size: '850 MB',
    },
    {
      id: 6,
      type: 'video',
      title: 'Product Demo Videos',
      description: 'Platform walkthrough and feature demonstrations',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80',
      downloadUrl: '#',
      format: 'MP4',
      size: '2.1 GB',
    },
  ];

  const pressCoverage: PressCoverage[] = [
    {
      id: 1,
      outlet: 'TechCrunch',
      logo: 'https://logo.clearbit.com/techcrunch.com',
      title: 'How AI is Transforming Travel Planning in Southeast Asia',
      excerpt: 'Trivgoo\'s innovative approach uses machine learning to create personalized itineraries...',
      url: '#',
      date: '2024-03-18',
      type: 'Feature',
    },
    {
      id: 2,
      outlet: 'Forbes',
      logo: 'https://logo.clearbit.com/forbes.com',
      title: 'The Startup Making Luxury Travel Accessible to Everyone',
      excerpt: 'Interview with Trivgoo CEO on democratizing premium travel experiences...',
      url: '#',
      date: '2024-03-12',
      type: 'Interview',
    },
    {
      id: 3,
      outlet: 'Travel + Leisure',
      logo: 'https://logo.clearbit.com/travelandleisure.com',
      title: 'Top 10 Travel Tech Innovations of 2024',
      excerpt: 'Trivgoo\'s AI trip planner earns spot on annual innovation list...',
      url: '#',
      date: '2024-03-05',
      type: 'Review',
    },
    {
      id: 4,
      outlet: 'The Jakarta Post',
      logo: 'https://logo.clearbit.com/thejakartapost.com',
      title: 'Indonesian Startup Expands Across ASEAN Region',
      excerpt: 'Local success story goes regional with new funding and partnerships...',
      url: '#',
      date: '2024-02-25',
      type: 'Article',
    },
    {
      id: 5,
      outlet: 'Bloomberg',
      logo: 'https://logo.clearbit.com/bloomberg.com',
      title: 'Investors Bet Big on Asian Travel Tech Recovery',
      excerpt: 'Analysis of recent funding rounds including Trivgoo\'s Series B...',
      url: '#',
      date: '2024-02-20',
      type: 'Feature',
    },
    {
      id: 6,
      outlet: 'CNN Travel',
      logo: 'https://logo.clearbit.com/cnn.com',
      title: 'Sustainable Tourism Gets a Tech Upgrade',
      excerpt: 'How technology is helping travelers make eco-friendly choices...',
      url: '#',
      date: '2024-02-15',
      type: 'Article',
    },
  ];

  const companyFacts = [
    { label: 'Founded', value: '2018' },
    { label: '', value: 'Denpasar, Indonesia' },
    { label: 'Countries Served', value: '8+' },
    { label: 'Team Members', value: '10+' },
    { label: 'Travelers Served', value: '50,000+' },
    { label: 'Destinations', value: '800+' },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Press Inquiries',
      detail: 'press@trivgoo.com',
      link: 'mailto:press@trivgoo.com',
    },
    {
      icon: Phone,
      title: 'Media Relations',
      detail: '+62 21 1234 5678 ext. 2',
      link: 'tel:+622112345678',
    },
    {
      icon: Users,
      title: 'Spokesperson Requests',
      detail: 'Request a media interview',
      link: '#contact-form',
    },
  ];

  const getCategoryColor = (category: PressRelease['category']) => {
    switch (category) {
      case 'Announcement': return 'bg-blue-100 text-blue-700';
      case 'Partnership': return 'bg-green-100 text-green-700';
      case 'Award': return 'bg-amber-100 text-amber-700';
      case 'Expansion': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAssetIcon = (type: MediaAsset['type']) => {
    switch (type) {
      case 'logo': return <Image className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'press-kit': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleDownloadAsset = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    // In real implementation, this would trigger download
    console.log('Downloading:', asset.title);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-600/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
              Press & Media
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              Our Story in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300">
                The Making
              </span>
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Latest news, media resources, and information about Trivgoo's mission to transform travel in Southeast Asia.
            </p>
          </div>
        </div>
      </div>

      {/* Press Releases */}
      <div className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
                Official Announcements
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Press Releases
              </h2>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center">
                View All Releases <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pressReleases.map((release) => (
              <div
                key={release.id}
                className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(release.category)}`}>
                    {release.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{release.date}</span>
                    {release.isNew && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {release.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {release.summary}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <a
                    href={release.downloadUrl}
                    className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </a>
                  <button className="text-gray-500 hover:text-gray-700">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Press Coverage */}
      <div className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
              In The News
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Press Coverage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Recent features and articles about Trivgoo in leading publications.
            </p>
          </div>

          <div className="space-y-6">
            {pressCoverage.map((coverage) => (
              <div
                key={coverage.id}
                className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <img
                        src={coverage.logo}
                        alt={coverage.outlet}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{coverage.title}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-gray-700">{coverage.outlet}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700`}>
                            {coverage.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 md:mt-0">{coverage.date}</span>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">{coverage.excerpt}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <a
                        href={coverage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center"
                      >
                        Read Article
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Quote className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Media Contact
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get in touch with our media relations team for interviews, statements, or additional information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={index}
                    href={contact.link}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-3 bg-primary-50 rounded-xl inline-block mb-4 text-primary-600 group-hover:bg-primary-100 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{contact.title}</h3>
                    <p className="text-gray-600">{contact.detail}</p>
                  </a>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Media Request Form</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Media Outlet *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your media organization"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Request Type *
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Select request type</option>
                    <option>Interview Request</option>
                    <option>Press Statement</option>
                    <option>Media Partnership</option>
                    <option>Event Coverage</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Please describe your media request..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PressAndMedia;