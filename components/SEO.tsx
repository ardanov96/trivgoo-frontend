import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title:           string;
  description?:    string;
  type?:           string;
  image?:          string;
  url?:            string;
  structuredData?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  type           = 'website',
  image          = 'https://trivgoo.com/logo.png',
  url,
  structuredData,
}) => {
  const { t } = useTranslation();

  const siteUrl    = 'https://trivgoo.com';
  const currentUrl = url ? `${siteUrl}${url}` : siteUrl;

  // Resolve description here so t() is in scope for the fallback
  const resolvedDescription = description ?? t('seo.default_description');

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={currentUrl} />
      <meta property="og:title"       content={`${title} | Trivgoo`} />
      <meta property="og:description" content={resolvedDescription} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card"        content="summary_large_image" />
      <meta property="twitter:url"         content={currentUrl} />
      <meta property="twitter:title"       content={`${title} | Trivgoo`} />
      <meta property="twitter:description" content={resolvedDescription} />
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
