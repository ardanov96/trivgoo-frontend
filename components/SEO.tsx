import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  jsonLd?: object;
  noindex?: boolean;
}

const defaultSEO = {
  title: "Trivgoo - Travel Booking Platform",
  description: "Find best travel deals, plan your trips, and book easily with Trivgoo.",
  keywords: "travel, booking, tour, vacation, trip planner, trivgoo",
  image: "https://trivgoo.com/thumbnail.png", // Fallback image
};

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords,
  type = 'website', 
  image, 
  url,
  jsonLd,
  noindex = false
}) => {
  const location = useLocation();
  const siteUrl = 'https://trivgoo.com'; // Change to actual site URL
  
  const finalTitle = title || defaultSEO.title;
  const finalDescription = description || defaultSEO.description;
  const finalKeywords = keywords || defaultSEO.keywords;
  const finalImage = image || defaultSEO.image;
  const currentPath = url || location.pathname;
  const currentUrl = `${siteUrl}${currentPath}`;

  return (
    <Helmet>
      {/* Basic Title & Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Noindex Strategy */}
      {noindex ? (
        <>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex, nofollow" />
          <meta http-equiv="Cache-Control" content="no-store" />
        </>
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
