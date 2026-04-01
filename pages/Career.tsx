import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReveal, useApplicationForm } from './career/hooks';
import type { JobPosition } from './career/constants';

import { HeroSection }      from './career/components/HeroSection';
import { CultureSection }   from './career/components/CultureSection';
import { JobsSection }      from './career/components/JobsSection';
import { ApplicationModal } from './career/components/ApplicationModal';
import { CtaSection }       from './career/components/CtaSection';

// ─────────────────────────────────────────────────────────────────────────────

const Career: React.FC = () => {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const { form, handleChange, reset } = useApplicationForm();

  const openPositionsRef = useRef<HTMLDivElement>(null);
  const cultureRef       = useRef<HTMLDivElement>(null);

  const cultureReveal = useReveal();
  const jobsReveal    = useReveal(0.06);
  const ctaReveal     = useReveal();

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
    // Find job index to get translated title
    const jobIndex = ['Senior Travel Experience Designer', 'Spesialis Pemasaran & Pertumbuhan', 'Analis Bisnis', 'Penulis Konten Perjalanan']
      .findIndex(title => title === selectedJob?.title);
    const displayTitle = jobIndex >= 0
      ? t(`career.job_${jobIndex}_title`, selectedJob?.title ?? '')
      : selectedJob?.title ?? '';

    alert(t('career.alert_submitted', 'Application for {{title}} has been submitted! We will contact you soon.', { title: displayTitle }));
    reset();
    setSelectedJob(null);
  };

  const setCultureRef = (el: HTMLDivElement | null) => {
    (cultureRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (cultureReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };
  const setJobsRef = (el: HTMLDivElement | null) => {
    (openPositionsRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (jobsReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

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
