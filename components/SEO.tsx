import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  image?: string;
  url?: string;
  structuredData?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = 'Trivgoo - Experience the Indonesia & Asia. Temukan paket wisata dan liburan terbaik.', 
  type = 'website', 
  image = 'https://trivgoo.com/logo.png', // Fallback image if any
  url,
  structuredData
}) => {
  const siteUrl = 'https://trivgoo.com'; // Change to actual site URL
  const currentUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Title & Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={`${title} | Trivgoo`} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={`${title} | Trivgoo`} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
