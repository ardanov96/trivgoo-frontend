import React from 'react';
import SEO from '../components/SEO';
import { BLOG_POSTS } from './blog/constants';
import { useReveal, useBlogFilter } from './blog/hooks';
import { HeroSection } from './blog/components/HeroSection';
import { FeaturedSection, TrendingSection, GridSection } from './blog/components/Sections';

const TravelBlog: React.FC = () => {
  const { searchQuery, setSearchQuery, currentPosts, currentPage, totalPages, handlePageChange, clearFilters } = useBlogFilter();

  const featuredPosts = BLOG_POSTS.filter((p) => p.isFeatured);
  const trendingPosts = BLOG_POSTS.filter((p) => p.isTrending);

  const featuredReveal = useReveal();
  const trendingReveal = useReveal();
  const gridReveal     = useReveal();

  return (
    <>
      <SEO 
        title="Travel Blog | Trivgoo" 
        description="Read the latest travel articles, tips, and destination guides on Trivgoo."
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Trivgoo Travel Blog",
          "description": "Read the latest travel articles, tips, and destination guides on Trivgoo.",
          "publisher": {
            "@type": "Organization",
            "name": "Trivgoo",
            "logo": {
              "@type": "ImageObject",
              "url": "https://trivgoo.com/logo.png"
            }
          }
        }}
      />
      <div className="min-h-screen bg-white">
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FeaturedSection ref={featuredReveal.ref} inView={featuredReveal.inView} posts={featuredPosts} />
      <TrendingSection ref={trendingReveal.ref} inView={trendingReveal.inView} posts={trendingPosts} />
      <GridSection
        ref={gridReveal.ref}
        inView={gridReveal.inView}
        posts={currentPosts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onClearFilters={clearFilters}
      />
    </div>
    </>
  );
};

export default TravelBlog;