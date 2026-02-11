import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  Globe,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import React, { useState, useRef } from 'react'; // Tambahkan useRef
import { Link } from 'react-router-dom';

interface JobPosition {
  id: number;
  title: string;
  department: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  location: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  isRemote: boolean;
}

interface TeamCulture {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const Career: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    portfolioUrl: '',
  });

  // Tambahkan refs untuk section
  const openPositionsRef = useRef<HTMLDivElement>(null);
  const cultureRef = useRef<HTMLDivElement>(null);

  const jobPositions: JobPosition[] = [
    {
      id: 1,
      title: 'Senior Travel Experience Designer',
      department: 'Product & Experience',
      type: 'Full-time',
      location: 'Denpasar, Indonesia',
      experience: '5+ years',
      description: 'Design extraordinary travel experiences that transform how people explore Southeast Asia. You\'ll work with local experts to create unique itineraries that combine culture, adventure, and luxury.',
      requirements: [
        '5+ years experience in travel industry or experience design',
        'Strong portfolio of travel products or curated experiences',
        'Deep knowledge of Southeast Asian destinations',
        'Excellent communication and presentation skills',
        'Ability to work cross-functionally with marketing, tech, and operations',
      ],
      benefits: [
        'Travel allowance for destination research',
        'Flexible work arrangements',
        'Health insurance & wellness program',
        'Professional development budget',
        'Discounted travel packages',
      ],
      postedDate: '2026-01-15',
      isRemote: true,
    },
    {
      id: 2,
      title: 'Growth Marketing Specialist',
      department: 'Marketing',
      type: 'Full-time',
      location: 'Denpasar, Indonesia',
      experience: '4+ years',
      description: 'Drive customer acquisition and retention through innovative marketing strategies. You\'ll own growth channels, analyze performance, and optimize campaigns to attract travelers worldwide.',
      requirements: [
        '4+ years in digital marketing with growth focus',
        'Experience with SEO, SEM, social media, and email marketing',
        'Analytical mindset with data-driven decision making',
        'Experience in travel or lifestyle brands preferred',
        'Strong copywriting and content creation skills',
      ],
      benefits: [
        'Performance-based bonuses',
        'Marketing conference budget',
        'Creative freedom and autonomy',
        'Team travel experiences',
        'Modern office in central Jakarta',
      ],
      postedDate: '2025-12-28',
      isRemote: false,
    },
    {
      id: 3,
      title: 'Business Analyst',
      department: 'Business Development',
      type: 'Full-time',
      location: 'Denpasar, Indonesia',
      experience: '1+ years',
      description: 'Be the voice of Trivgoo! Help travelers plan their dream vacations, resolve issues, and create memorable experiences through exceptional customer service.',
      requirements: [
        '1+ years in customer service or hospitality',
        'Excellent communication skills in English and Bahasa',
        'Problem-solving and empathy skills',
        'Ability to work flexible hours (including weekends)',
        'Passion for travel and helping others',
      ],
      benefits: [
        'Work from anywhere in Indonesia',
        'Travel credit for personal use',
        'Comprehensive training program',
        'Career growth opportunities',
        'Mental wellness support',
      ],
      postedDate: '2025-12-25',
      isRemote: true,
    },
    {
      id: 6,
      title: 'Travel Content Writer',
      department: 'Content',
      type: 'Contract',
      location: 'Remote',
      experience: '2+ years',
      description: 'Create compelling travel content that inspires and informs. Write destination guides, blog posts, and social media content that showcases the beauty of Southeast Asia.',
      requirements: [
        '2+ years travel writing or content creation',
        'Portfolio of published travel articles',
        'SEO knowledge and best practices',
        'Ability to work independently and meet deadlines',
        'Passion for storytelling and cultural exploration',
      ],
      benefits: [
        'Flexible schedule and remote work',
        'Opportunity to travel for research',
        'Exposure to international audience',
        'Creative freedom and ownership',
        'Potential for full-time conversion',
      ],
      postedDate: '2025-12-20',
      isRemote: true,
    },
  ];

  const teamCulture: TeamCulture[] = [
    {
      icon: Compass,
      title: 'Adventure-Driven',
      description: 'We encourage exploration and new experiences, both in work and travel.',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: Heart,
      title: 'People-First',
      description: 'Our team\'s well-being and growth are as important as business success.',
      color: 'text-red-500 bg-red-50',
    },
    {
      icon: Sparkles,
      title: 'Innovation Mindset',
      description: 'We constantly seek better ways to solve problems and create value.',
      color: 'text-purple-500 bg-purple-50',
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'We think globally while staying rooted in local expertise.',
      color: 'text-green-500 bg-green-50',
    },
  ];

  const perks = [
    {
      icon: Briefcase,
      title: 'Flexible Work',
      description: 'Hybrid options, flexible hours, and work-life balance',
    },
    {
      icon: DollarSign,
      title: 'Competitive Compensation',
      description: 'Market-rate salaries, bonuses, and performance incentives',
    },
    {
      icon: GraduationCap,
      title: 'Learning & Growth',
      description: 'Training budgets, conference access, and career development',
    },
    {
      icon: Home,
      title: 'Travel Benefits',
      description: 'Discounted travel, FAM trips, and destination research opportunities',
    },
    {
      icon: Shield,
      title: 'Health & Wellness',
      description: 'Comprehensive insurance, mental health support, and wellness programs',
    },
    {
      icon: Award,
      title: 'Recognition',
      description: 'Regular feedback, performance bonuses, and team celebrations',
    },
  ];

  // Fungsi untuk scroll ke section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      // Hitung offset untuk memperhitungkan navbar fixed (jika ada)
      const navbarHeight = 80; // Sesuaikan dengan tinggi navbar Anda
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleApplyNow = (job: JobPosition) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the application to your backend
    console.log('Application submitted:', { job: selectedJob, ...applicationForm });
    alert(`Application submitted for ${selectedJob?.title}! We'll contact you soon.`);
    setApplicationForm({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      portfolioUrl: '',
    });
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-600/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
              Join Our Journey
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              Build The Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300">
                Of Travel
              </span>
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed mb-8">
              We're looking for passionate innovators to help transform how people experience Indonesia & Asia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {/* Ganti Link dengan button dan tambahkan onClick */}
              <button
                onClick={() => scrollToSection(openPositionsRef)}
                className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
              >
                View Open Positions
              </button>
              <button
                onClick={() => scrollToSection(cultureRef)}
                className="px-8 py-4 bg-primary-700 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
              >
                Our Culture
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Our Culture Section - Tambahkan ref */}
      <div id="culture" ref={cultureRef} className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 block">
              Life at Trivgoo
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              More Than Just a Job
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We believe work should be meaningful, growth-oriented, and yes—even fun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {teamCulture.map((culture, index) => {
              const Icon = culture.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-2xl ${culture.color.split(' ')[1]} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${culture.color.split(' ')[0]}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{culture.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{culture.description}</p>
                </div>
              );
            })}
          </div>

          {/* Perks & Benefits */}
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">
                Perks & Benefits
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We invest in our team's happiness, growth, and well-being.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="p-3 bg-primary-50 rounded-xl mr-4 text-primary-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{perk.title}</h4>
                      <p className="text-sm text-gray-600">{perk.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions Section - Tambahkan ref */}
      <div id="open-positions" ref={openPositionsRef} className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Open Positions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Find your perfect role and help us shape the future of travel.
            </p>
          </div>

          {/* Job Filters */}
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold text-sm hover:bg-primary-700 transition-colors">
              All Positions
            </button>
            <button className="px-6 py-3 bg-white text-gray-700 rounded-full font-bold text-sm border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors">
              Technology
            </button>
            <button className="px-6 py-3 bg-white text-gray-700 rounded-full font-bold text-sm border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors">
              Operations
            </button>
            <button className="px-6 py-3 bg-white text-gray-700 rounded-full font-bold text-sm border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors">
              Marketing
            </button>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {jobPositions.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {job.department}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                        {job.isRemote}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApplyNow(job)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center mt-4 md:mt-0"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <Target className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Experience</div>
                      <div className="font-bold text-gray-900">{job.experience}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Posted</div>
                      <div className="font-bold text-gray-900">{job.postedDate}</div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{job.description}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {job.requirements.length} requirements • {job.benefits.length} benefits
                  </div>
                  <button
                    onClick={() => handleApplyNow(job)}
                    className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center"
                  >
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for {selectedJob.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">{selectedJob.department}</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{selectedJob.location}</span>
                    {selectedJob.isRemote && (
                      <>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-primary-600 font-bold">Remote</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleSubmitApplication}>
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={applicationForm.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={applicationForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={applicationForm.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+62 812 3456 7890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Portfolio/Website (Optional)
                    </label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={applicationForm.portfolioUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      name="coverLetter"
                      value={applicationForm.coverLetter}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us why you're excited about this role and what makes you a great fit..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Resume/CV *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Upload Resume
                      </label>
                      <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center"
                  >
                    Submit Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Don't See Your Perfect Role?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:careers@trivgoo.com"
              className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Email Your Resume
            </a>
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

export default Career;