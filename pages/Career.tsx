import React, { useRef, useState } from 'react';
import { useReveal, useApplicationForm } from './career/hooks';
import type { JobPosition } from './career/constants';

import { HeroSection }        from './career/components/HeroSection';
import { CultureSection }     from './career/components/CultureSection';
import { JobsSection }        from './career/components/JobsSection';
import { ApplicationModal }   from './career/components/ApplicationModal';
import { CtaSection }         from './career/components/CtaSection';

// ─────────────────────────────────────────────────────────────────────────────

const Career: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const { form, handleChange, reset } = useApplicationForm();

  // Section refs for scroll-to
  const openPositionsRef = useRef<HTMLDivElement>(null);
  const cultureRef       = useRef<HTMLDivElement>(null);

  // Scroll-reveal
  const cultureReveal = useReveal();
  const jobsReveal    = useReveal(0.06);
  const ctaReveal     = useReveal();

  // ── Helpers ──────────────────────────────────────────────────────────────
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const top = ref.current.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleApply = (job: JobPosition) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lamaran dikirim:', { job: selectedJob, ...form });
    alert(`Lamaran untuk ${selectedJob?.title} telah terkirim! Kami akan segera menghubungi Anda.`);
    reset();
    setSelectedJob(null);
  };

  // ── Dual-ref helper (scroll target + reveal) ──────────────────────────────
  const setCultureRef = (el: HTMLDivElement | null) => {
    (cultureRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (cultureReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };
  const setJobsRef = (el: HTMLDivElement | null) => {
    (openPositionsRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (jobsReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        onViewPositions={() => scrollTo(openPositionsRef)}
        onViewCulture={() => scrollTo(cultureRef)}
      />

      <CultureSection ref={setCultureRef} inView={cultureReveal.inView} />

      <JobsSection ref={setJobsRef} inView={jobsReveal.inView} onApply={handleApply} />

      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <CtaSection ref={ctaReveal.ref} inView={ctaReveal.inView} />
    </div>
  );
};

export default Career;
