import {
  ArrowLeft, Search, HelpCircle, MessageCircle, Mail, Phone,
  BookOpen, CreditCard, MapPin, Calendar, Users, Shield,
  ChevronDown, ChevronUp, Clock, Globe, Headphones, FileText, Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQ { id: number; category: string; question: string; answer: string; }

const FAQ_DATA: FAQ[] = [
  { id: 1, category: 'Pemesanan & Pembayaran', question: 'Bagaimana cara melakukan pemesanan di Trivgoo?', answer: 'Untuk melakukan pemesanan, cukup cari destinasi yang Anda inginkan, pilih tanggal perjalanan, pilih dari pengalaman yang telah kami kurasi, lalu lanjutkan ke checkout. Anda dapat membayar dengan aman menggunakan kartu kredit/debit, transfer bank, atau dompet digital. Anda akan menerima email konfirmasi segera setelah pembayaran diproses.' },
  { id: 2, category: 'Pemesanan & Pembayaran', question: 'Metode pembayaran apa saja yang diterima?', answer: 'Kami menerima kartu kredit utama (Visa, Mastercard, American Express), kartu debit, transfer bank, dan dompet digital populer termasuk GoPay, OVO, dan Dana. Semua pembayaran diproses dengan aman melalui gateway pembayaran terenkripsi kami.' },
  { id: 3, category: 'Pemesanan & Pembayaran', question: 'Bisakah saya mengubah pemesanan setelah konfirmasi?', answer: 'Ya, Anda dapat mengubah pemesanan tergantung pada kebijakan penyedia layanan. Masuk ke akun Anda, buka "Pemesanan Saya," dan pilih pemesanan yang ingin diubah. Perubahan mungkin dikenakan biaya tambahan sesuai ketersediaan.' },
  { id: 4, category: 'Pemesanan & Pembayaran', question: 'Apakah informasi pembayaran saya aman?', answer: 'Tentu saja. Kami menggunakan enkripsi SSL standar industri dan pemroses pembayaran yang memenuhi standar PCI-DSS untuk memastikan informasi pembayaran Anda terlindungi sepenuhnya. Kami tidak pernah menyimpan detail kartu kredit lengkap Anda di server kami.' },
  { id: 5, category: 'Pembatalan & Refund', question: 'Bagaimana kebijakan pembatalan Trivgoo?', answer: 'Kebijakan pembatalan bervariasi per penyedia layanan. Secara umum: (1) Pembatalan 7+ hari sebelum keberangkatan mendapat refund penuh minus biaya pemrosesan 5%, (2) 3-7 hari sebelumnya mendapat refund 50%, (3) Kurang dari 3 hari tidak ada refund. Kebijakan spesifik ditampilkan saat pemesanan.' },
  { id: 6, category: 'Pembatalan & Refund', question: 'Bagaimana cara membatalkan pemesanan?', answer: 'Untuk membatalkan pemesanan, masuk ke akun Anda, navigasi ke "Pemesanan Saya," pilih pemesanan yang ingin dibatalkan, dan klik "Batalkan Pemesanan." Ikuti langkah-langkah untuk menyelesaikan pembatalan. Anda akan menerima email konfirmasi dengan detail refund jika ada.' },
  { id: 7, category: 'Pembatalan & Refund', question: 'Berapa lama proses refund?', answer: 'Refund biasanya diproses dalam 7-14 hari kerja sejak tanggal pembatalan. Waktu yang tepat tergantung pada metode pembayaran dan bank Anda. Anda akan menerima notifikasi email setelah refund diproses.' },
  { id: 8, category: 'Pembatalan & Refund', question: 'Apa yang terjadi jika penyedia layanan membatalkan?', answer: 'Jika penyedia layanan membatalkan pemesanan Anda, Anda akan mendapatkan refund penuh tanpa biaya pembatalan. Kami akan segera menghubungi Anda dan membantu menemukan alternatif jika diinginkan.' },
  { id: 9, category: 'Akun & Profil', question: 'Bagaimana cara membuat akun?', answer: 'Klik "Daftar" di pojok kanan atas, masukkan nama, alamat email, dan buat kata sandi. Anda juga dapat mendaftar menggunakan akun Google atau Facebook untuk pendaftaran yang lebih cepat. Verifikasi alamat email Anda untuk mengaktifkan akun.' },
  { id: 10, category: 'Akun & Profil', question: 'Saya lupa kata sandi. Apa yang harus dilakukan?', answer: 'Klik "Masuk" lalu pilih "Lupa Kata Sandi." Masukkan alamat email terdaftar Anda, dan kami akan mengirimkan tautan reset kata sandi. Ikuti instruksi di email untuk membuat kata sandi baru.' },
  { id: 11, category: 'Akun & Profil', question: 'Bisakah saya mengubah alamat email?', answer: 'Ya, Anda dapat memperbarui alamat email di pengaturan akun. Buka "Pengaturan Profil," klik "Edit Profil," perbarui email, dan verifikasi alamat email baru melalui tautan konfirmasi yang kami kirimkan.' },
  { id: 12, category: 'Akun & Profil', question: 'Bagaimana cara menghapus akun?', answer: 'Untuk menghapus akun, hubungi tim dukungan kami di cs@trivgoo.com dengan detail akun Anda. Perlu diketahui bahwa tindakan ini bersifat permanen dan Anda akan kehilangan akses ke semua riwayat pemesanan dan preferensi tersimpan.' },
  { id: 13, category: 'Perjalanan & Destinasi', question: 'Apakah saya memerlukan asuransi perjalanan?', answer: 'Meskipun asuransi perjalanan tidak wajib, kami sangat menyarankannya untuk perlindungan dari keadaan tak terduga seperti pembatalan perjalanan, kedaruratan medis, atau kehilangan bagasi. Kami dapat membantu mengatur asuransi perjalanan melalui mitra kami.' },
  { id: 14, category: 'Perjalanan & Destinasi', question: 'Dokumen apa yang dibutuhkan untuk perjalanan internasional?', answer: 'Untuk perjalanan internasional, Anda biasanya memerlukan paspor yang masih berlaku (minimal 6 bulan), visa yang sesuai, dan sertifikat kesehatan atau catatan vaksinasi yang diperlukan. Persyaratan bervariasi per destinasi, pastikan cek sebelum memesan.' },
  { id: 15, category: 'Perjalanan & Destinasi', question: 'Apakah Trivgoo membantu pengurusan visa?', answer: 'Ya, kami menyediakan layanan bantuan visa untuk banyak destinasi. Hubungi tim dukungan kami dengan detail perjalanan Anda, dan kami akan membimbing Anda melalui proses dan persyaratan aplikasi visa.' },
  { id: 16, category: 'Perjalanan & Destinasi', question: 'Apakah transfer bandara termasuk dalam paket tur?', answer: 'Transfer bandara termasuk dalam beberapa paket tur tetapi tidak semua. Periksa detail paket saat pemesanan untuk melihat apa yang termasuk. Anda juga dapat menambahkan layanan transfer bandara secara terpisah saat checkout.' },
  { id: 17, category: 'Layanan Pelanggan', question: 'Bagaimana cara menghubungi layanan pelanggan?', answer: 'Anda dapat menghubungi tim layanan pelanggan kami melalui email di cs@trivgoo.com, WhatsApp di +62 821-4444-3784, atau live chat di website kami. Jam layanan kami: Senin-Jumat pukul 09.00-18.00 WIB, dan Sabtu 09.00-15.00 WIB.' },
  { id: 18, category: 'Layanan Pelanggan', question: 'Apakah ada layanan darurat 24/7?', answer: 'Kami menawarkan dukungan darurat 24/7 untuk wisatawan yang sedang dalam perjalanan aktif. Untuk pertanyaan umum, jam layanan reguler kami adalah Senin-Jumat pukul 09.00-18.00 WIB, dan Sabtu 09.00-15.00 WIB.' },
  { id: 19, category: 'Layanan Pelanggan', question: 'Bahasa apa yang digunakan tim dukungan?', answer: 'Tim dukungan kami fasih berbahasa Indonesia dan Inggris. Kami juga dapat mengatur dukungan dalam bahasa lain berdasarkan permintaan.' },
  { id: 20, category: 'Layanan Pelanggan', question: 'Seberapa cepat saya mendapat respons?', answer: 'Kami bertujuan merespons semua pertanyaan dalam 24 jam pada hari kerja. Untuk urusan mendesak atau wisatawan dalam perjalanan aktif, kami memberikan bantuan segera melalui hotline darurat 24/7.' },
];

const CATEGORIES = [
  { id: 'all', label: 'Semua Topik', icon: BookOpen },
  { id: 'Pemesanan & Pembayaran', label: 'Pemesanan & Pembayaran', icon: CreditCard },
  { id: 'Pembatalan & Refund', label: 'Pembatalan & Refund', icon: Shield },
  { id: 'Akun & Profil', label: 'Akun & Profil', icon: Users },
  { id: 'Perjalanan & Destinasi', label: 'Perjalanan & Destinasi', icon: MapPin },
  { id: 'Layanan Pelanggan', label: 'Layanan Pelanggan', icon: Headphones },
];

const CONTACT_OPTIONS = [
  { id: 1, icon: MessageCircle, title: 'Live Chat', description: 'Chat langsung dengan tim kami', action: 'Mulai Chat', color: 'from-blue-500 to-blue-600', available: 'Tersedia Sekarang', link: 'https://wa.me/6282144443784' },
  { id: 2, icon: Mail, title: 'Email', description: 'Respons dalam 24 jam', action: 'Kirim Email', color: 'from-purple-500 to-purple-600', email: 'cs@trivgoo.com', link: 'mailto:cs@trivgoo.com' },
  { id: 3, icon: Phone, title: 'Telepon', description: 'Bicara langsung dengan tim kami', action: 'Hubungi Sekarang', color: 'from-green-500 to-green-600', phone: '+62 821-4444-3784', link: 'tel:+6282144443784' },
  { id: 4, icon: Globe, title: 'WhatsApp', description: 'Respons cepat via WhatsApp', action: 'Kirim Pesan', color: 'from-emerald-500 to-emerald-600', whatsapp: '+62 821-4444-3784', link: 'https://wa.me/6282144443784' },
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => setOpenFaqId(openFaqId === id ? null : id);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Animated Hero ── */}
      <div className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}>

        <style>{`
          @keyframes hcGrid  { 0%{background-position:0 0} 100%{background-position:40px 40px} }
          @keyframes hcGlow  { 0%,100%{opacity:.35} 50%{opacity:.65} }
          @keyframes hcScan  { 0%{transform:translateY(0%);opacity:.12} 50%{opacity:.25} 100%{transform:translateY(100%);opacity:.12} }
          @keyframes hcFloat { 0%{opacity:0;transform:translateY(32px)} 100%{opacity:1;transform:translateY(0)} }
          @keyframes hcBadge { 0%{opacity:0;transform:translateY(-12px)} 100%{opacity:1;transform:translateY(0)} }
          @keyframes hcSearch{ 0%{opacity:0;transform:translateY(24px) scale(.97)} 100%{opacity:1;transform:translateY(0) scale(1)} }
          .hc-grid  { animation: hcGrid  3s linear infinite; }
          .hc-glow1 { animation: hcGlow  5s ease-in-out infinite; }
          .hc-glow2 { animation: hcGlow  7s ease-in-out infinite 2s; }
          .hc-glow3 { animation: hcGlow  6s ease-in-out infinite 1s; }
          .hc-scan  { animation: hcScan  4s linear infinite; }
          .hc-back  { animation: hcFloat .6s cubic-bezier(.22,1,.36,1) both; }
          .hc-badge { animation: hcBadge .6s cubic-bezier(.22,1,.36,1) .1s both; }
          .hc-title { animation: hcFloat .9s cubic-bezier(.22,1,.36,1) .25s both; }
          .hc-sub   { animation: hcFloat .7s cubic-bezier(.22,1,.36,1) .4s both; }
          .hc-srch  { animation: hcSearch .8s cubic-bezier(.22,1,.36,1) .55s both; }
        `}</style>

        <div className="hc-grid absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="hc-glow1 absolute pointer-events-none rounded-full" style={{ top:'-8%', right:'-4%', width:440, height:440, background:'radial-gradient(circle, rgba(255,200,150,0.18) 0%, transparent 70%)' }} />
        <div className="hc-glow2 absolute pointer-events-none rounded-full" style={{ bottom:'-12%', left:'-6%', width:380, height:380, background:'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div className="hc-glow3 absolute pointer-events-none rounded-full" style={{ top:'45%', left:'35%', width:260, height:260, background:'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)' }} />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M 0% 70% Q 40% 15% 85% 35%" fill="none" stroke="rgba(255,220,200,0.22)" strokeWidth="1.5" strokeDasharray="8 6" />
          <path d="M 20% 90% Q 55% 30% 95% 15%" fill="none" stroke="rgba(255,200,150,0.15)" strokeWidth="1" strokeDasharray="6 5" />
          <path d="M 70% 100% Q 80% 50% 100% 30%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 4" />
        </svg>

        <div className="hc-scan absolute inset-x-0 pointer-events-none" style={{ height:3, top:0, background:'linear-gradient(90deg,transparent,rgba(255,200,180,0.35),transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background:'linear-gradient(to bottom,transparent,rgba(80,15,5,0.3))' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/" className="hc-back inline-flex items-center text-red-200 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Kembali ke Beranda</span>
          </Link>

          <div className="hc-badge flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <HelpCircle className="w-6 h-6 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">Pusat Bantuan · Trivgoo</span>
          </div>

          <h1 className="hc-title text-4xl md:text-6xl font-serif font-bold mb-5 leading-tight">
            Pusat Bantuan
          </h1>
          <p className="hc-sub text-xl text-red-100 max-w-3xl leading-relaxed mb-10">
            Temukan jawaban atas pertanyaan umum atau hubungi tim dukungan kami.
          </p>

          {/* Search */}
          <div className="hc-srch max-w-3xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari artikel bantuan, FAQ, atau topik..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20 text-lg shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Jelajahi berdasarkan Kategori</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                    isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}>
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Pertanyaan yang Sering Diajukan</h2>
              <span className="text-sm text-gray-500 font-semibold">{filteredFAQs.length} hasil</span>
            </div>

            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary-300 transition-colors">
                      <button onClick={() => toggleFaq(faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                        <div className="flex-1 pr-4">
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-2">{faq.category}</span>
                          <h3 className="text-base font-bold text-gray-900">{faq.question}</h3>
                        </div>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed text-sm">{faq.answer}</p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada hasil</h3>
                <p className="text-gray-600">Coba sesuaikan pencarian atau jelajahi kategori di atas.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-8 text-white sticky top-8" style={{ background:'linear-gradient(135deg,#6b1a12 0%,#c34134 100%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl"><Headphones className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold">Butuh Bantuan Lagi?</h3>
              </div>
              <p className="text-red-100 mb-6 leading-relaxed">Tidak menemukan yang dicari? Tim dukungan kami siap membantu Anda.</p>
              <div className="space-y-3 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-red-200" /><span className="font-bold text-sm">Jam Layanan</span></div>
                  <p className="text-sm text-red-100">Senin-Jumat: 09.00–18.00 WIB<br />Sabtu: 09.00–15.00 WIB</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2"><Zap className="w-5 h-5 text-red-200" /><span className="font-bold text-sm">Darurat 24/7</span></div>
                  <p className="text-sm text-red-100">Untuk wisatawan dalam perjalanan aktif</p>
                </div>
              </div>
              <Link to="/contact-us" className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl">
                Hubungi Dukungan
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Hubungi Kami</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Pilih cara yang paling nyaman untuk menghubungi tim dukungan kami</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <div key={opt.id} className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${opt.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{opt.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{opt.description}</p>
                  {'available' in opt && opt.available && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">{opt.available}</span>
                  )}
                  {'email' in opt && opt.email && <p className="text-sm text-gray-500 mb-4">{opt.email}</p>}
                  {'phone' in opt && opt.phone && <p className="text-sm text-gray-500 mb-4">{opt.phone}</p>}
                  {'whatsapp' in opt && opt.whatsapp && <p className="text-sm text-gray-500 mb-4">{opt.whatsapp}</p>}
                  <a href={opt.link}
                    target={opt.link?.startsWith('mailto') || opt.link?.startsWith('tel') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-center block text-sm">
                    {opt.action}
                  </a>
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
