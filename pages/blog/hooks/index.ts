import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import type { BlogPost } from '../types';
import { BLOG_POSTS, POSTS_PER_PAGE } from '../constants';

// ── Scroll-reveal ─────────────────────────────────────────────────────────────
export const useReveal = (amount = 0.12) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
};

// ── Blog filter + pagination ──────────────────────────────────────────────────
export const useBlogFilter = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery,      setSearchQuery]       = useState('');
  const [filteredPosts,    setFilteredPosts]     = useState<BlogPost[]>(BLOG_POSTS);
  const [currentPage,      setCurrentPage]       = useState(1);

  useEffect(() => {
    let filtered = BLOG_POSTS;
    if (selectedCategory !== 'all')
      filtered = filtered.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim())
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const totalPages      = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const indexOfFirst    = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts    = filteredPosts.slice(indexOfFirst, indexOfFirst + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => { setSelectedCategory('all'); setSearchQuery(''); };

  return {
    selectedCategory, setSelectedCategory,
    searchQuery,      setSearchQuery,
    currentPosts,     currentPage, totalPages,
    handlePageChange, clearFilters,
  };
};
