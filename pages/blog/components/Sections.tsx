import { ArrowRight, ChevronLeft, ChevronRight, Search, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost } from '../types';
import { fadeUp, fadeLeft, fadeRight, stagger } from '../constants';
import { FeaturedCard, TrendingCard, GridCard } from './BlogCard';

// ── Featured Section ──────────────────────────────────────────────────────────
interface FeaturedProps { posts: BlogPost[]; inView: boolean; }

export const FeaturedSection = React.forwardRef<HTMLDivElement, FeaturedProps>(({ posts, inView }, ref) => {
  const navigate = useNavigate();
  if (!posts.length) return null;
  return (
    <div className="bg-gray-50 py-16 md:py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <motion.div variants={fadeLeft} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-2 block">Artikel Unggulan</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Pilihan Editor</h2>
            <p className="text-gray-600">Cerita pilihan yang dikurasi oleh tim redaksi kami</p>
          </motion.div>
          <motion.div className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors cursor-pointer" variants={fadeRight} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            Lihat Semua Unggulan <ArrowRight className="w-4 h-4 ml-2" />
          </motion.div>
        </div>
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {posts.map((post, idx) => (
            <FeaturedCard key={post.id} post={post} index={idx} onClick={() => navigate(`/blog/${post.id}`)} />
          ))}
        </motion.div>
      </div>
    </div>
  );
});
FeaturedSection.displayName = 'FeaturedSection';

// ── Trending Section ──────────────────────────────────────────────────────────
interface TrendingProps { posts: BlogPost[]; inView: boolean; }

export const TrendingSection = React.forwardRef<HTMLDivElement, TrendingProps>(({ posts, inView }, ref) => {
  const navigate = useNavigate();
  if (!posts.length) return null;
  return (
    <div className="bg-white py-16 md:py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="flex items-center justify-between mb-10" variants={fadeLeft} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Sedang Trending</h2>
              <p className="text-gray-600">Artikel paling banyak dibaca minggu ini</p>
            </div>
          </div>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          {posts.map((post, idx) => (
            <TrendingCard key={post.id} post={post} index={idx} onClick={() => navigate(`/blog/${post.id}`)} />
          ))}
        </motion.div>
      </div>
    </div>
  );
});
TrendingSection.displayName = 'TrendingSection';

// ── Grid Section ──────────────────────────────────────────────────────────────
interface GridProps {
  posts:          BlogPost[];
  inView:         boolean;
  currentPage:    number;
  totalPages:     number;
  onPageChange:   (p: number) => void;
  onClearFilters: () => void;
}

export const GridSection = React.forwardRef<HTMLDivElement, GridProps>(({ posts, inView, currentPage, totalPages, onPageChange, onClearFilters }, ref) => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50 py-16 md:py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-10" variants={fadeLeft} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Artikel Terbaru</h2>
          <p className="text-gray-600">Jelajahi semua artikel dan panduan perjalanan kami</p>
        </motion.div>

        {posts.length > 0 ? (
          <>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
              {posts.map((post, idx) => (
                <GridCard key={post.id} post={post} index={idx} onClick={() => navigate(`/blog/${post.id}`)} />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div className="flex justify-center items-center mt-16 space-x-2" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                  .map((page, index, array) => {
                    const showEllipsis = index < array.length - 1 && array[index + 1] - page > 1;
                    return (
                      <React.Fragment key={page}>
                        <button onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-full font-bold ${currentPage === page ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                          {page}
                        </button>
                        {showEllipsis && <span className="text-gray-400 px-2">...</span>}
                      </React.Fragment>
                    );
                  })}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div className="text-center py-20" variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Artikel tidak ditemukan</h3>
            <p className="text-gray-600">Coba sesuaikan kata kunci pencarian Anda</p>
            <motion.button onClick={onClearFilters} className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              Hapus Filter
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
});
GridSection.displayName = 'GridSection';
