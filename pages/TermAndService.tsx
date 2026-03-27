import { ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { id: 'tentang', label: 'Terms and Service' },
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'services', label: 'Services Provided' },
  { id: 'user-obligations', label: 'User Obligations' },
  { id: 'booking', label: 'Booking and Payment' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'payment-methods', label: 'Payment Methods' },
  { id: 'cancellation', label: 'Cancellation and Refunds' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'privacy', label: 'Privacy and Data Protection' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact Us' },
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

const TermAndService: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
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
          @keyframes gridScroll2 { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
          @keyframes glowPulse2  { 0%,100% { opacity:.35; } 50% { opacity:.65; } }
          @keyframes scanLine2   { 0% { transform:translateY(0%); opacity:.12; } 50% { opacity:.25; } 100% { transform:translateY(100%); opacity:.12; } }
          @keyframes floatIn2    { 0% { opacity:0; transform:translateY(32px); } 100% { opacity:1; transform:translateY(0); } }
          @keyframes badgeIn2    { 0% { opacity:0; transform:translateY(-12px); } 100% { opacity:1; transform:translateY(0); } }
          @keyframes routeGlow   { 0%,100%{opacity:.2;} 50%{opacity:.45;} }
          .ts-grid  { animation: gridScroll2 3s linear infinite; }
          .ts-glow1 { animation: glowPulse2 5s ease-in-out infinite; }
          .ts-glow2 { animation: glowPulse2 7s ease-in-out infinite 2.5s; }
          .ts-glow3 { animation: glowPulse2 6s ease-in-out infinite 1s; }
          .ts-scan  { animation: scanLine2 4s linear infinite; }
          .ts-title { animation: floatIn2 .9s cubic-bezier(.22,1,.36,1) .3s both; }
          .ts-badge { animation: badgeIn2 .6s cubic-bezier(.22,1,.36,1) .1s both; }
          .ts-meta  { animation: floatIn2 .7s cubic-bezier(.22,1,.36,1) .55s both; }
          .ts-back  { animation: floatIn2 .6s cubic-bezier(.22,1,.36,1) 0s both; }
          .ts-route { animation: routeGlow 4s ease-in-out infinite; }
        `}</style>

        {/* Animated dot grid */}
        <div className="ts-grid absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,220,200,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glow blobs */}
        <div className="ts-glow1 absolute pointer-events-none rounded-full" style={{
          top: '-10%', right: '-6%', width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(255,200,150,0.16) 0%, transparent 70%)'
        }} />
        <div className="ts-glow2 absolute pointer-events-none rounded-full" style={{
          bottom: '-15%', left: '-8%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)'
        }} />
        <div className="ts-glow3 absolute pointer-events-none rounded-full" style={{
          top: '35%', right: '25%', width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)'
        }} />

        {/* SVG dashed routes — different pattern from PrivacyPolicy */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path className="ts-route" d="M 90% 90% Q 60% 20% 10% 40%" fill="none" stroke="rgba(255,220,200,0.3)" strokeWidth="1.5" strokeDasharray="8 6" />
          <path className="ts-route" d="M 80% 10% Q 45% 60% 5% 70%" fill="none" stroke="rgba(255,200,150,0.2)" strokeWidth="1" strokeDasharray="6 5" style={{ animationDelay:'1s' }} />
          <path className="ts-route" d="M 50% 95% Q 70% 40% 95% 25%" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5 4" style={{ animationDelay:'2s' }} />
          {/* small decorative dots */}
          <circle cx="10%" cy="40%" r="3" fill="rgba(255,220,200,0.5)" style={{ animation:'glowPulse2 3s ease-in-out infinite' }} />
          <circle cx="90%" cy="90%" r="2.5" fill="rgba(251,191,36,0.6)" style={{ animation:'glowPulse2 4s ease-in-out infinite .5s' }} />
          <circle cx="80%" cy="10%" r="2" fill="rgba(255,200,150,0.5)" style={{ animation:'glowPulse2 5s ease-in-out infinite 1s' }} />
        </svg>

        {/* Scan line */}
        <div className="ts-scan absolute inset-x-0 pointer-events-none" style={{
          height: 3, top: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,200,180,0.35), transparent)'
        }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(80,15,5,0.35))' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={langPath('/')} className="ts-back inline-flex items-center text-red-200 hover:text-white text-sm mb-8 group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>

          <div className="ts-badge flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <FileText className="w-5 h-5 text-red-100" />
            </div>
            <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">Legal · Trivgoo</span>
          </div>

          <h1 className="ts-title text-4xl md:text-6xl font-serif font-bold leading-tight mb-4">
            Terms and Service
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
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Terms and Service</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Selamat datang di trivgoo.com. Ketentuan Layanan ("Ketentuan") ini mengatur penggunaan Anda atas situs web, aplikasi mobile, dan layanan yang disediakan oleh PT Trivgoo Global Nusantara ("Kami", "Trivgoo").</p>
              <p className="text-gray-700 leading-relaxed mb-4">Dengan mengakses atau menggunakan platform kami, Anda menyetujui untuk terikat oleh Ketentuan ini. Jika Anda tidak menyetujui Ketentuan ini, mohon untuk tidak menggunakan layanan kami.</p>
              <p className="text-gray-700 leading-relaxed mb-4">Ketentuan Layanan ini mencakup hal-hal berikut:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm pl-2">
                {['Penerimaan Ketentuan;','Layanan yang Disediakan;','Kewajiban Pengguna;','Pemesanan dan Pembayaran;','Pembatalan dan Pengembalian Dana;','Batasan Tanggung Jawab;','Privasi dan Perlindungan Data;','Perubahan pada Ketentuan; dan','Hubungi Kami.'].map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            </section>

            <section id="acceptance" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">1. Acceptance of Terms</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Dengan membuat akun, melakukan pemesanan, atau menggunakan layanan Trivgoo, Anda mengakui bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan ini, serta Kebijakan Privasi kami.</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Anda harus berusia minimal 18 tahun untuk menggunakan layanan kami</li>
                <li>Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda</li>
                <li>Anda setuju untuk memberikan informasi yang akurat dan lengkap</li>
                <li>Penggunaan platform kami oleh individu di bawah umur harus dalam pengawasan orang tua atau wali</li>
              </ul>
            </section>

            <section id="services" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">2. Services Provided</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Trivgoo beroperasi sebagai platform pemesanan perjalanan yang menghubungkan wisatawan dengan penyedia layanan termasuk tur, akomodasi, rental mobil, dan transfer bandara di seluruh Indonesia dan Asia.</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li><strong>Paket Tur:</strong> Pengalaman perjalanan yang dikurasi dan tur berpemandu</li>
                <li><strong>Akomodasi:</strong> Hotel, vila, dan penginapan berkualitas</li>
                <li><strong>Rental Mobil:</strong> Layanan sewa kendaraan dengan atau tanpa pengemudi</li>
                <li><strong>Transfer Bandara:</strong> Layanan antar-jemput bandara</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4"><strong>Catatan Penting:</strong> Trivgoo bertindak sebagai perantara. Kami tidak bertanggung jawab atas penyediaan layanan aktual yang dilakukan oleh vendor pihak ketiga.</p>
            </section>

            <section id="user-obligations" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">3. User Obligations</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Sebagai pengguna Trivgoo, Anda setuju untuk:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Memberikan informasi yang akurat, terkini, dan lengkap selama pendaftaran dan pemesanan</li>
                <li>Menggunakan platform hanya untuk tujuan yang sah sesuai dengan Ketentuan ini</li>
                <li>Tidak terlibat dalam aktivitas penipuan atau mencoba memanipulasi sistem kami</li>
                <li>Menghormati hak kekayaan intelektual Trivgoo dan pihak ketiga</li>
                <li>Tidak mengirimkan virus, malware, atau kode berbahaya lainnya</li>
                <li>Mematuhi semua undang-undang lokal, nasional, dan internasional yang berlaku</li>
                <li>Tidak menyalahgunakan program promosi, voucher, atau sistem poin loyalitas</li>
              </ul>
            </section>

            <section id="booking" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">4. Booking and Payment</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Ketika Anda melakukan pemesanan melalui Trivgoo, Anda mengadakan kontrak dengan penyedia layanan. Semua pemesanan tunduk pada ketersediaan dan konfirmasi dari penyedia layanan terkait.</p>
              <p className="text-gray-700 leading-relaxed">Pemesanan Anda dianggap terkonfirmasi setelah pembayaran diterima dan konfirmasi dikirimkan ke email Anda. Harap tinjau semua detail dengan cermat dan hubungi kami segera jika terdapat kesalahan.</p>
            </section>

            <section id="pricing" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pricing</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Semua harga ditampilkan dalam mata uang lokal dan sudah termasuk pajak yang berlaku kecuali dinyatakan lain. Harga dapat bervariasi berdasarkan tanggal, ketersediaan, dan faktor lainnya.</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Harga yang ditampilkan adalah harga final termasuk biaya layanan platform</li>
                <li>Trivgoo berhak mengubah harga kapan saja tanpa pemberitahuan sebelumnya</li>
                <li>Harga yang telah dikonfirmasi dalam pemesanan tidak akan berubah kecuali ada kesalahan teknis</li>
              </ul>
            </section>

            <section id="payment-methods" className="mb-12 scroll-mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Methods</h3>
              <div className="w-8 h-0.5 bg-gray-300 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Kami menerima berbagai metode pembayaran untuk kenyamanan Anda:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2">
                <li>Kartu kredit dan debit (Visa, Mastercard, American Express)</li>
                <li>Transfer bank langsung</li>
                <li>Dompet digital (GoPay, OVO, Dana, dan lainnya)</li>
                <li>Virtual Account</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">Pembayaran harus dilakukan secara penuh pada saat pemesanan kecuali dinyatakan lain. Semua transaksi pembayaran diproses melalui gateway pembayaran yang aman dan tersertifikasi PCI-DSS.</p>
            </section>

            <section id="cancellation" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">5. Cancellation and Refunds</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Kebijakan pembatalan bervariasi tergantung pada penyedia layanan dan jenis pemesanan. Harap tinjau kebijakan pembatalan spesifik sebelum melakukan pemesanan.</p>
              <p className="text-gray-700 leading-relaxed mb-4 font-medium">Kebijakan Pembatalan Umum:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 mb-4">
                <li><strong>Lebih dari 7 hari sebelumnya:</strong> Pengembalian dana penuh dikurangi biaya pemrosesan (umumnya 5%)</li>
                <li><strong>3–7 hari sebelumnya:</strong> Pengembalian dana 50% dari total pemesanan</li>
                <li><strong>Kurang dari 3 hari sebelumnya:</strong> Tidak ada pengembalian dana</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">Pengembalian dana diproses dalam 7–14 hari kerja ke metode pembayaran asli.</p>
            </section>

            <section id="liability" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">6. Limitation of Liability</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Trivgoo bertindak semata-mata sebagai platform yang menghubungkan wisatawan dengan penyedia layanan. Kami tidak bertanggung jawab atas:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 mb-4">
                <li>Kualitas, keamanan, atau legalitas layanan yang diberikan oleh vendor pihak ketiga</li>
                <li>Cedera, kerusakan, atau kerugian yang terjadi selama perjalanan Anda</li>
                <li>Keterlambatan, pembatalan, atau perubahan yang dilakukan oleh penyedia layanan</li>
                <li>Kejadian force majeure termasuk bencana alam, kerusuhan politik, atau pandemi</li>
                <li>Kehilangan atau kerusakan barang pribadi selama perjalanan</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">Tanggung jawab maksimum kami untuk setiap klaim tidak akan melebihi total jumlah yang dibayarkan oleh Anda untuk pemesanan spesifik yang bersangkutan.</p>
            </section>

            <section id="privacy" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">7. Privacy and Data Protection</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Kami berkomitmen untuk melindungi privasi dan informasi pribadi Anda. Kebijakan Privasi kami menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 mb-4">
                <li>Kami menggunakan enkripsi standar industri untuk melindungi informasi pribadi dan pembayaran Anda</li>
                <li>Anda memiliki hak untuk mengakses, memperbarui, atau menghapus data pribadi Anda</li>
                <li>Kami tidak menjual data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">Untuk informasi lebih lengkap, silakan baca{' '}
                <Link to={langPath('/privacy-policy')} className="text-primary-600 hover:underline font-medium">Kebijakan Privasi</Link>{' '}kami secara penuh.</p>
            </section>

            <section id="changes" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">8. Changes to Terms</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Trivgoo berhak untuk mengubah Ketentuan ini kapan saja. Kami akan memberitahu pengguna tentang perubahan signifikan melalui email atau melalui pemberitahuan di platform kami.</p>
              <p className="text-gray-700 leading-relaxed">Penggunaan layanan kami yang berkelanjutan setelah perubahan tersebut merupakan penerimaan Anda atas Ketentuan yang telah diperbarui.</p>
            </section>

            <section id="contact" className="mb-12 scroll-mt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">9. Contact Us</h2>
              <div className="w-12 h-1 bg-primary-600 rounded mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">Jika Anda memiliki pertanyaan atau kekhawatiran tentang Ketentuan Layanan ini, tim kami siap membantu Anda.</p>
              <ul className="list-none space-y-2 text-gray-700 text-sm pl-2">
                <li>📧 Email: <a href="mailto:cs@trivgoo.com" className="text-primary-600 hover:underline font-medium">cs@trivgoo.com</a></li>
                <li>💬 WhatsApp: <a href="https://wa.me/6282144443784" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">+62 821-4444-3784</a></li>
              </ul>
            </section>

            <div className="border-t border-gray-200 pt-10 mt-10">
              <p className="text-sm text-gray-500 mb-6">Dengan menggunakan layanan Trivgoo, Anda menyatakan telah membaca dan menyetujui Ketentuan Layanan ini.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={langPath('/contact-us')} className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">Hubungi Customer Support</Link>
                <Link to={langPath('/privacy-policy')} className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Lihat Privacy Policy</Link>
              </div>
            </div>

          </article>
        </div>
      </div>
    </div>
  );
};

export default TermAndService;
