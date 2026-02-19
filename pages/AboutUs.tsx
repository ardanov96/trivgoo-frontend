import {
  CheckCircle,
  Globe,
  Shield,
  Star,
  Users,
  Compass,
  Building2,
  Moon,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const [activeGallery, setActiveGallery] = useState(0);

  const stats = [
    { value: '50,000+', label: 'Happy Travelers', icon: Users },
    { value: '1,200+', label: 'Destinations Covered', icon: Globe },
    { value: '95%', label: 'Satisfaction Rate', icon: Star },
    { value: '24/7', label: 'Customer Support', icon: Shield },
  ];

  const services = [
    {
      icon: Compass,
      title: 'Personalize Travel Agent',
      slug: 'personalize',
      tagline: 'Perjalanan Sesuai Kebutuhan Anda',
      color: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Personalized travel planning',
      description:
        'Kami memberikan solusi untuk merancang perjalanan sesuai kebutuhan personal / group / perusahaan Anda. Trivgoo bertindak sebagai mitra perjalanan strategis yang menangani seluruh proses, dimulai dari perencanaan, pemesanan, koordinasi hingga pelaksanaan, secara terintegrasi dan profesional.',
      highlights: [
        'Perjalanan rekreasi & wisata',
        'Perjalanan dinas & offsite meeting',
        'Incentive trip',
        'Perjalanan khusus manajemen',
      ],
    },
    {
      icon: Moon,
      title: 'Ramadan CSR & Iftar Experience',
      slug: 'ramadan',
      tagline: 'Buka Puasa Bermakna & Dampak Nyata',
      color: 'from-emerald-500 to-teal-400',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Masjid Ramadan Experience',
      description:
        'Program acara perusahaan yang menggabungkan buka puasa bersama dengan kegiatan tanggung jawab sosial (CSR) dalam satu rangkaian yang bermakna. Dirancang khusus untuk momen Ramadan, membantu perusahaan memperkuat nilai kebersamaan, kepedulian sosial, dan citra positif perusahaan.',
      highlights: [
        'Internal karyawan & mitra',
        'Konsep acara rapi & bernilai',
        'Kegiatan CSR terintegrasi',
        'Citra korporasi positif',
      ],
    },
    {
      icon: Building2,
      title: 'Corporate Gathering & Team Building',
      slug: 'corporate',
      tagline: 'Profesional, Hangat, & Berdampak',
      color: 'from-violet-500 to-purple-400',
      bg: 'bg-violet-50',
      textColor: 'text-violet-600',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Corporate Gathering and Team Building',
      description:
        'Paket yang dirancang untuk mendukung komunikasi internal perusahaan, penyelarasan visi, serta peningkatan keterlibatan karyawan. Acara dikemas secara profesional, namun tetap hangat, memungkinkan manajemen menyampaikan pesan strategis dalam suasana yang nyaman dan terstruktur.',
      highlights: [
        'Corporate meeting & update',
        'Employee engagement',
        'Team building',
        'Sesi apresiasi perusahaan',
      ],
    },
  ];

  const galleryTabs = [
    {
      label: 'Personalize Travel',
      icon: Compass,
      activeColor: 'bg-blue-500',
      images: [
        { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', caption: 'Perjalanan Rekreasi Keluarga' },
        { src: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80', caption: 'Incentive Trip Eksklusif' },
        { src: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=800&q=80', caption: 'Offsite Meeting & Retreat' },
        { src: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80', caption: 'Perjalanan Dinas Profesional' },
        { src: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80', caption: 'Wisata Group & Komunitas' },
        { src: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80', caption: 'Perjalanan Manajemen Senior' },
      ],
    },
    {
      label: 'Ramadan CSR & Iftar',
      icon: Moon,
      activeColor: 'bg-emerald-500',
      images: [
        { src: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=800&q=80', caption: 'Iftar Bersama Karyawan' },
        { src: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', caption: 'Kegiatan CSR Ramadan' },
        { src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', caption: 'Sajian Iftar Premium' },
        { src: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', caption: 'Donasi & Kepedulian Sosial' },
        { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', caption: 'Dekorasi Venue Ramadan' },
        { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', caption: 'Dinner & Networking Iftar' },
      ],
    },
    {
      label: 'Corporate Gathering',
      icon: Building2,
      activeColor: 'bg-violet-500',
      images: [
        { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'Corporate Event Gathering' },
        { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', caption: 'Team Building Workshop' },
        { src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80', caption: 'Employee Engagement Outdoor' },
        { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', caption: 'Sesi Apresiasi Karyawan' },
        { src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80', caption: 'Presentasi Strategis' },
        { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', caption: 'Aktivitas Tim Kolaboratif' },
      ],
    },
  ];

  const currentGallery = galleryTabs[activeGallery];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-600/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
              Tentang Kami
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              Mitra Perjalanan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-amber-300">
                Terpercaya Anda
              </span>
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
              PT Trivgoo Global Nusantara
            </p>
          </div>
        </div>
      </div>

      {/* About Company Section */}
      <div className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Lebih dari Sekadar Platform Perjalanan
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                PT Trivgoo Global Nusantara hadir sebagai mitra perjalanan terpercaya yang mengintegrasikan kemudahan teknologi dengan sentuhan Artificial Intelligence. Berkomitmen untuk menyederhanakan setiap perjalanan, baik untuk urusan personal, bisnis, rekreasi, dan ibadah, kami menghadirkan solusi lengkap.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Trivgoo adalah platform travel berbasis AI yang tidak hanya menjual tiket dan hotel, tetapi menjadi{' '}
                <strong className="text-primary-700">personal travel experience</strong>. Berbeda dengan kompetitor yang berfokus pada transaksi, Trivgoo berfokus pada pengalaman perjalanan yang dipersonalisasi secara mendalam berdasarkan kepribadian, minat, dan kebutuhan pengguna.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">AI-Powered Personalization</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">Solusi Personal & Korporat</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-700">Layanan End-to-End</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl p-8 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?auto=format&fit=crop&w=800&q=80"
                  alt="Travel Experience"
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl w-64">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <Globe className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">8 Negara</div>
                      <div className="text-sm text-gray-500">Asia Tenggara & Timur Tengah</div>
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

      {/* Our Services Section */}
      <div className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              LAYANAN KAMI
            </h2>
          </div>

          <div className="space-y-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Hero image with overlay title */}
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-60`}></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-80">
                          Paket {index + 1}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold leading-snug mb-1">
                        {service.title}
                      </h3>
                      <p className="text-white/80 italic text-base">"{service.tagline}"</p>
                    </div>
                  </div>

                  {/* Content: description + highlights */}
                  <div className="p-8 md:p-12">
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8`}>
                      <div className="lg:w-1/2">
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      <div className="lg:w-1/2">
                        <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${service.textColor}`}>
                          Cocok Untuk:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {service.highlights.map((item, i) => (
                            <div key={i} className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
                              <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${service.textColor}`} />
                              <span className="text-gray-700 font-medium text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              GALERI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Sekilas pandang pengalaman nyata dari setiap paket layanan Trivgoo.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {galleryTabs.map((tab, i) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActiveGallery(i)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 border-2 ${
                    activeGallery === i
                      ? `${tab.activeColor} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Masonry-style gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentGallery.images.map((img, i) => (
              <div
                key={`${activeGallery}-${i}`}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                  i === 0 ? 'col-span-2 row-span-1' : ''
                }`}
                style={{ aspectRatio: i === 0 ? '16/7' : '4/3' }}
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="font-semibold text-sm drop-shadow">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Siap Memulai Perjalanan Bersama Kami?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Bergabunglah bersama ribuan pelancong yang telah merasakan pengalaman perjalanan yang lebih bermakna bersama Trivgoo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Mulai Perjalanan Anda
            </Link>
            <Link
              to="/contact-us"
              className="px-8 py-4 bg-primary-800 text-white rounded-full font-bold text-lg border border-primary-500 hover:bg-primary-900 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Hubungi Tim Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
