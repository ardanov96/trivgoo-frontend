import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScrollReveal }   from './about/hooks/useScrollReveal';
import { HeroSection }       from './about/components/HeroSection';
import { AboutSection, StatsSection } from './about/components/AboutSection';
import { ServicesSection }   from './about/components/ServicesSection';
import { GallerySection }    from './about/components/GallerySection';
import { CtaSection }        from './about/components/CtaSection';

// AboutUs is a thin wrapper — t() is used inside each sub-component
const AboutUs: React.FC = () => {
  const [activeGallery, setActiveGallery] = useState(0);

  const aboutRef    = useScrollReveal();
  const statsRef    = useScrollReveal();
  const servicesRef = useScrollReveal(0.08);
  const galleryRef  = useScrollReveal();
  const ctaRef      = useScrollReveal();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection    ref={aboutRef.ref}    inView={aboutRef.inView} />
      <StatsSection    ref={statsRef.ref}    inView={statsRef.inView} />
      <ServicesSection ref={servicesRef.ref} inView={servicesRef.inView} />
      <GallerySection  ref={galleryRef.ref}  inView={galleryRef.inView} activeGallery={activeGallery} onTabChange={setActiveGallery} />
      <CtaSection      ref={ctaRef.ref}      inView={ctaRef.inView} />
    </div>
  );
};

export default AboutUs;
