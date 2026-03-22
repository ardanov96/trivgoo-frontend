import React, { useState } from 'react';
import { useReveal }             from './press/hooks/useReveal';
import type { MediaAsset }       from './press/constants';

import { HeroSection }           from './press/components/HeroSection';
import { PressReleasesSection }  from './press/components/PressReleasesSection';
import { CoverageSection }       from './press/components/CoverageSection';
import { MediaAssetsSection }    from './press/components/MediaAssetsSection';
import { ContactSection }        from './press/components/ContactSection';
import { CtaSection }            from './press/components/CtaSection';

// ─────────────────────────────────────────────────────────────────────────────

const PressAndMedia: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const pressReveal    = useReveal();
  const coverageReveal = useReveal();
  const assetsReveal   = useReveal();
  const contactReveal  = useReveal();
  const ctaReveal      = useReveal();

  // selectedAsset could be used for a download modal — kept as state for future use
  void selectedAsset;

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <PressReleasesSection ref={pressReveal.ref}    inView={pressReveal.inView} />
      <CoverageSection      ref={coverageReveal.ref} inView={coverageReveal.inView} />
      <MediaAssetsSection   ref={assetsReveal.ref}   inView={assetsReveal.inView} onPreview={setSelectedAsset} />
      <ContactSection       ref={contactReveal.ref}  inView={contactReveal.inView} />
      <CtaSection           ref={ctaReveal.ref}       inView={ctaReveal.inView} />
    </div>
  );
};

export default PressAndMedia;
