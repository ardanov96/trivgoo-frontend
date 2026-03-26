import { ArrowLeft, ChevronRight, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// ── Section data ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'tentang', label: 'Pemberitahuan Privasi' },
  { id: 'data-pribadi', label: 'Data Pribadi yang Kami Kumpulkan' },
  { id: 'pembuatan-akun', label: 'Pembuatan Akun dan Pemesanan' },
  { id: 'transaksi', label: 'Untuk Proses Transaksi atau Pembayaran' },
  { id: 'informasi-biometrik', label: 'Informasi Biometrik' },
  { id: 'pihak-ketiga', label: 'Untuk Pihak Ketiga yang Terafiliasi Dengan Kami' },
  { id: 'karier', label: 'Karier dan Vendor' },
  { id: 'data-teknis', label: 'Data Teknis' },
  { id: 'cara-kami', label: 'Cara Kami Menggunakan Data Pribadi Anda' },
  { id: 'tujuan', label: 'Tujuan Transaksi dan Layanan' },
  { id: 'transfer', label: 'Transfer Data Pribadi Lintas Batas' },
  { id: 'hak-pemilik', label: 'Hak Pemilik Data Pribadi' },
  { id: 'portabilitas', label: 'Portabilitas Data' },
  { id: 'perhatian', label: 'Perhatian dan Keluhan' },
  { id: 'hukum', label: 'Hukum yang Berlaku' },
  { id: 'bahasa', label: 'Bahasa yang Digunakan' },
];

const NavItem: React.FC<{ section: typeof SECTIONS[0]; active: boolean; onClick: () => void }> = ({ section, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${
      active ? 'text-primary-600 font-bold bg-primary-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
    }`}
  >
    {active && <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />}
    <span className={active ? '' : 'pl-3.5'}>{section.label}</span>
  </button>
);

const PrivacyPolicy: React.FC = () => {
  const { langPath } = useLangNavigate();
  const [activeSection, setActiveSection] = useState('tentang');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Animated Hero ── */}
      <div className="relative text-white py-20 md:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b1a12 0%, #a83328 35%, #c34134 65%, #E05845 100%)' }}>

        <style>{`
          @keyframes gridScroll { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
          @keyframes glowPulse  { 0%,100% { opacity:.35; } 50% { opacity:.65; } }
          @keyframes scanLine   { 0% { transform:translateY(0%); opacity:.12; } 50% { opacity:.25; } 100% { transform:translateY(100%); opacity:.12; } }
          @keyframes floatIn    { 0% { opacity:0; transform:translateY(32px); } 100% { opacity:1; transform:translateY(0); } }
          @keyframes badgeIn    { 0% { opacity:0; transform:translateY(-12px); } 100% { opacity:1; transform:translateY(0); } }
          .hero-grid { animation: gridScroll 3s linear infinite; }
          .hero-glow1 { animation: glowPulse 5s ease-in-out infinite; }
          .hero-glow2 { animation: glowPulse 7s ease-in-out infinite 2s; }
          .hero-scan  { animation: scanLine 4s linear infinite; }
          .hero-title { animation: floatIn .9s cubic-bezier(.22,1,.36,1) .3s both; }
          .hero-badge { animation: badgeIn .6s cubic-bezier(.22,1,.36,1) .1s both; }
          .hero-meta  { animation: floatIn .7s cubic-bezier(.22,1,.36,1) .55s both; }
          .hero-back  { animation: floatIn .6s cubic-bezier(.22,1,.36,1) 0s both; }
        `}</style>

        {/* Animated dot grid */}
        <div className="hero-grid absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glow blobs */}
        <div className="hero-glow1 absolute pointer-events-none rounded-full" style={{
          top: '-8%', right: '-4%', width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(255,200,150,0.18) 0%, transparent 70%)'
        }} />
        <div className="hero-glow2 absolute pointer-events-none rounded-full" style={{
          bottom: '-12%', left: '-6%', width: 360, height: 360,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
        }} />
        <div className="hero-glow1 absolute pointer-events-none rounded-full" style={{
          top: '40%', left: '30%', width: 260, height: 260,
          background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)',
          animationDelay: '1s'
        }} />

        {/* SVG dashed flight routes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M 5% 80% Q 40% 10% 80% 30%" fill="none" stroke="rgba(255,220,200,0.25)" strokeWidth="1.5" strokeDasharray="8 6" />
          <path d="M 15% 60% Q 55% 5% 90% 50%" fill="none" stroke="rgba(255,200,150,0.15)" strokeWidth="1" strokeDasharray="6 5" />
          <path d="M 0% 40% Q 50% 70% 95% 20%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 4" />
        </svg>

        {/* Scan line */}
        <div className="hero-scan absolute inset-x-0 pointer-events-none" style={{
          height: 3, top: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,200,180,0.35), transparent)'
        }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(80,15,5,0.35))' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={langPath('/')} className="hero-back inline-flex items-center text-red-200 hover:text-white text-sm mb-8 group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>

          <div className="hero-badge flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Shield className="w-5 h-5 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">Legal · Trivgoo</span>
          </div>

          <h1 className="hero-title text-4xl md:text-6xl font-serif font-bold leading-tight mb-4">
            Privacy Policy
          </h1>

        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-10">

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">ON THIS PAGE</p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <NavItem key={s.id} section={s} active={activeSection === s.id} onClick={() => scrollTo(s.id)} />
                ))}
              </nav>
            </div>
          </aside>

          <article className="flex-1 min-w-0 prose prose-gray max-w-none">

            <section id="tentang" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Pemberitahuan Privasi</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Selamat datang di situs trivgoo.com.</p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Situs ini dimiliki, dioperasikan, dan di-hosting oleh PT Trivgoo Global Nusantara, sebuah perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kami menyediakan situs web dan layanan yang tersedia secara online, melalui situs web: www.trivgoo.com atau situs web mobile, m.trivgoo.com atau aplikasi mobile trivgoo.com untuk iOS & trivgoo.com untuk Android, serta berbagai akses, media, perangkat, dan platform ("Layanan Online"), baik yang telah tersedia maupun yang akan tersedia di kemudian hari.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Di trivgoo.com, privasi Anda dan perlindungan data pribadi Anda merupakan hal yang sangat penting bagi Kami. Pemberitahuan Privasi ini menjelaskan bagaimana Kami mengumpulkan, menggunakan, mengungkapkan, menyimpan, dan melindungi data pribadi Anda sesuai dengan ketentuan hukum yang berlaku.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Untuk menjaga kepercayaan Anda kepada Kami, Kami berkomitmen untuk selalu menjaga kerahasiaan data pribadi Anda. Oleh karena itu, Kami menganjurkan Anda untuk membaca Pemberitahuan Privasi ini dan senantiasa memperbaharuinya guna memahami praktik-praktik Kami sehubungan dengan data pribadi Anda.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2 font-medium">Pemberitahuan Privasi ini mencakup hal-hal berikut:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm pl-2">
                {['Data Pribadi yang Kami Kumpulkan;','Cara Kami Menggunakan Data Pribadi Anda;','Tujuan Transaksi dan Layanan;','Pendistribusian Data Pribadi;','Pemindahan Data Pribadi Lintas Batas;','Hak Anda atas Data Pribadi;','Portabilitas Data;','Perhatian dan Keluhan;','Perubahan pada Kebijakan Privasi ini;','Kekhawatiran dan Keluhan;','Hukum yang Berlaku; dan','Bahasa yang Digunakan.'].map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            </section>

            <section id="data-pribadi" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">1. Data Pribadi yang Kami Kumpulkan</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Kami mengumpulkan data pribadi ketika Anda berinteraksi dengan Layanan Online kami. Jenis data yang Kami kumpulkan bergantung pada layanan yang Anda gunakan dan cara Anda berinteraksi dengan kami.</p>
              <p className="text-gray-700 leading-relaxed">Data pribadi yang Kami kumpulkan antara lain meliputi: nama lengkap, alamat email, nomor telepon, tanggal lahir, alamat, data pembayaran, serta preferensi perjalanan Anda.</p>
            </section>

            <section id="pembuatan-akun" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pembuatan Akun dan Pemesanan</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Ketika Anda membuat akun atau melakukan pemesanan, Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Nama lengkap dan informasi identitas</li><li>Alamat email dan nomor telepon</li>
                <li>Kata sandi (disimpan dalam bentuk terenkripsi)</li><li>Preferensi perjalanan dan riwayat pemesanan</li>
                <li>Informasi tentang peserta perjalanan lainnya jika relevan</li>
              </ul>
            </section>

            <section id="transaksi" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Untuk Proses Transaksi atau Pembayaran</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Untuk memproses pembayaran, Kami memerlukan informasi keuangan tertentu. Kami menggunakan gateway pembayaran pihak ketiga yang tersertifikasi PCI-DSS untuk memastikan keamanan data keuangan Anda. Informasi yang dikumpulkan meliputi:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Detail kartu kredit atau debit (dienkripsi sepenuhnya)</li><li>Informasi akun bank untuk transfer langsung</li>
                <li>Riwayat transaksi dan konfirmasi pembayaran</li><li>Alamat penagihan</li>
              </ul>
            </section>

            <section id="informasi-biometrik" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Informasi Biometrik</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">Dalam situasi tertentu, dan hanya atas persetujuan eksplisit Anda, Kami mungkin mengumpulkan data biometrik seperti sidik jari atau pengenalan wajah untuk tujuan verifikasi identitas. Data ini diproses secara lokal di perangkat Anda dan tidak disimpan di server kami kecuali dinyatakan lain.</p>
            </section>

            <section id="pihak-ketiga" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Untuk Pihak Ketiga yang Terafiliasi Dengan Kami</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Kami dapat menerima informasi tentang Anda dari mitra bisnis kami, termasuk agen perjalanan, operator tur, hotel, dan penyedia layanan lainnya yang bekerja sama dengan trivgoo.com.</p>
              <p className="text-gray-700 leading-relaxed">Semua mitra pihak ketiga kami terikat oleh perjanjian kerahasiaan dan wajib mematuhi standar perlindungan data yang sama seperti yang kami terapkan.</p>
            </section>

            <section id="karier" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Karier dan Vendor</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">Jika Anda melamar posisi pekerjaan atau mendaftar sebagai vendor, Kami mengumpulkan informasi yang Anda berikan dalam aplikasi Anda, termasuk CV, portofolio, referensi, dan detail kontak.</p>
            </section>

            <section id="data-teknis" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Data Teknis</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Secara otomatis, Kami mengumpulkan data teknis tertentu saat Anda mengakses Layanan Online kami:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Alamat IP dan informasi perangkat</li><li>Jenis browser dan sistem operasi</li>
                <li>Data log akses dan waktu kunjungan</li><li>Halaman yang dikunjungi dan durasi sesi</li>
                <li>Data lokasi perkiraan berdasarkan IP (bukan GPS)</li><li>Cookie dan teknologi pelacakan serupa</li>
              </ul>
            </section>

            <section id="cara-kami" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">2. Cara Kami Menggunakan Data Pribadi Anda</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Kami menggunakan data pribadi Anda untuk berbagai tujuan yang sah, termasuk untuk menyediakan, meningkatkan, dan mempersonalisasi layanan kami, serta untuk memenuhi kewajiban hukum kami.</p>
              <p className="text-gray-700 leading-relaxed mb-4">Dasar hukum yang Kami gunakan untuk memproses data Anda meliputi: pelaksanaan kontrak, kepentingan sah bisnis, kepatuhan hukum, dan persetujuan Anda.</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Memproses dan mengelola pemesanan Anda</li><li>Mengirimkan konfirmasi, tiket, dan voucher</li>
                <li>Memberikan layanan pelanggan dan dukungan teknis</li><li>Mengirimkan komunikasi pemasaran (dengan persetujuan Anda)</li>
                <li>Meningkatkan platform dan mengembangkan fitur baru</li><li>Mencegah penipuan dan menjaga keamanan platform</li>
                <li>Memenuhi kewajiban hukum dan regulasi</li>
              </ul>
            </section>

            <section id="tujuan" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">3. Tujuan Transaksi dan Layanan</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Data pribadi Anda digunakan untuk memfasilitasi transaksi yang Anda lakukan melalui platform kami, termasuk koordinasi dengan penyedia layanan pihak ketiga seperti hotel, operator tur, dan perusahaan transportasi.</p>
              <p className="text-gray-700 leading-relaxed">Kami juga dapat menggunakan data Anda untuk menawarkan promosi yang dipersonalisasi, program loyalitas, dan rekomendasi berdasarkan riwayat perjalanan dan preferensi Anda.</p>
            </section>

            <section id="transfer" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">4. Transfer Data Pribadi Lintas Batas</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Sebagai platform perjalanan yang beroperasi secara internasional, data Anda mungkin ditransfer ke dan diproses di negara-negara di luar Indonesia. Ketika hal ini terjadi, Kami memastikan perlindungan yang memadai tersedia sesuai dengan hukum yang berlaku.</p>
              <p className="text-gray-700 leading-relaxed">Transfer data internasional dilakukan dengan mekanisme perlindungan yang sesuai, termasuk perjanjian transfer data standar dan persyaratan kontrak yang mengikat.</p>
            </section>

            <section id="hak-pemilik" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">5. Hak Pemilik Data Pribadi</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Sesuai dengan peraturan perlindungan data yang berlaku, Anda memiliki hak-hak berikut terkait data pribadi Anda:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li><strong>Hak Akses:</strong> Meminta salinan data pribadi yang Kami simpan tentang Anda</li>
                <li><strong>Hak Perbaikan:</strong> Meminta koreksi data yang tidak akurat atau tidak lengkap</li>
                <li><strong>Hak Penghapusan:</strong> Meminta penghapusan data Anda dalam kondisi tertentu</li>
                <li><strong>Hak Pembatasan:</strong> Membatasi pemrosesan data Anda dalam situasi tertentu</li>
                <li><strong>Hak Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu</li>
                <li><strong>Hak Penarikan Persetujuan:</strong> Mencabut persetujuan Anda kapan saja</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">Untuk menggunakan hak-hak tersebut, silakan hubungi kami di <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">cs@trivgoo.com</a>.</p>
            </section>

            <section id="portabilitas" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">6. Portabilitas Data</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">Anda berhak menerima data pribadi Anda dalam format yang terstruktur, umum digunakan, dan dapat dibaca mesin. Untuk mengajukan permintaan portabilitas data, hubungi kami di <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">cs@trivgoo.com</a>.</p>
            </section>

            <section id="perhatian" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">7. Perhatian dan Keluhan</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Jika Anda memiliki kekhawatiran atau keluhan mengenai cara Kami menangani data pribadi Anda, silakan hubungi kami terlebih dahulu.</p>
              <ul className="list-none space-y-2 text-gray-700 text-sm pl-2">
                <li>📧 Email: <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">cs@trivgoo.com</a></li>
                <li>💬 WhatsApp: <a href="https://wa.me/6282144443784" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">+62 821-4444-3784</a></li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">Kami akan merespons keluhan Anda dalam waktu 30 hari kerja sejak keluhan diterima.</p>
            </section>

            <section id="hukum" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">8. Hukum yang Berlaku</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Pemberitahuan Privasi ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia, termasuk namun tidak terbatas pada Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi.</p>
              <p className="text-gray-700 leading-relaxed">Setiap sengketa yang timbul sehubungan dengan Pemberitahuan Privasi ini akan diselesaikan melalui pengadilan yang berwenang di Republik Indonesia.</p>
            </section>

            <section id="bahasa" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">9. Bahasa yang Digunakan</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed">Pemberitahuan Privasi ini tersedia dalam Bahasa Indonesia dan Bahasa Inggris. Dalam hal terdapat perbedaan interpretasi antara versi Bahasa Indonesia dan Bahasa Inggris, maka versi Bahasa Indonesia yang akan berlaku.</p>
            </section>

            <div className="border-t border-gray-200 pt-10 mt-10">
              <p className="text-sm text-gray-500 mb-6">Jika Anda memiliki pertanyaan lebih lanjut tentang kebijakan privasi kami, silakan hubungi kami.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={langPath('/contact-us')} className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">Hubungi Customer Support</Link>
                <Link to={langPath('/terms-and-service')} className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Lihat Terms of Service</Link>
              </div>
            </div>

          </article>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
