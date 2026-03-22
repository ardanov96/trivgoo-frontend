import { Bookmark, Calendar, Clock, Eye, Heart, MessageCircle, Share2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogPost } from '../types';
import { formatDate, categoryLabel } from '../constants';

// ── Featured card (16/9 ratio, large) ────────────────────────────────────────
interface FeaturedCardProps { post: BlogPost; index: number; onClick: () => void; }

export const FeaturedCard = ({ post, index, onClick }: FeaturedCardProps) => (
  <motion.div
    variants={{ hidden: { opacity: 0, scale: 0.88 }, visible: (i: number) => ({ opacity: 1, scale: 1, transition: { duration: 0.55, delay: i * 0.1 } }) }}
    custom={index}
    whileHover={{ y: -6, boxShadow: '0 24px 55px rgba(0,0,0,0.11)' }}
    onClick={onClick}
    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer"
  >
    <div className="aspect-[16/9] relative overflow-hidden">
      <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-600 text-white">Unggulan</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
    </div>
    <div className="p-8">
      <div className="flex items-center mb-4">
        <div className="flex items-center text-sm text-gray-500 mr-4"><Calendar className="w-4 h-4 mr-1" />{formatDate(post.publishDate)}</div>
        <div className="flex items-center text-sm text-gray-500"><Clock className="w-4 h-4 mr-1" />{post.readTime} baca</div>
      </div>
      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{post.title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <div className="flex items-center">
          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <div className="font-bold text-gray-900">{post.author.name}</div>
            <div className="text-sm text-gray-500">{post.author.role}</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-500">
          <button className="flex items-center hover:text-red-500 transition-colors" onClick={(e) => e.stopPropagation()}>
            <Heart className="w-5 h-5" /><span className="ml-1 text-sm">{post.likes}</span>
          </button>
          <button className="flex items-center hover:text-blue-500 transition-colors" onClick={(e) => e.stopPropagation()}>
            <MessageCircle className="w-5 h-5" /><span className="ml-1 text-sm">{post.comments}</span>
          </button>
          <button className="hover:text-gray-700 transition-colors" onClick={(e) => e.stopPropagation()}>
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

// ── Trending card (4/3 ratio, medium) ────────────────────────────────────────
interface TrendingCardProps { post: BlogPost; index: number; onClick: () => void; }

export const TrendingCard = ({ post, index, onClick }: TrendingCardProps) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 44 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1 } }) }}
    custom={index}
    whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,0,0,0.09)' }}
    onClick={onClick}
    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer"
  >
    <div className="aspect-[4/3] relative overflow-hidden">
      <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">Trending</span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <span className="mr-3">{formatDate(post.publishDate)}</span>
        <span>•</span>
        <span className="ml-3">{post.readTime} baca</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">{post.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full mr-2" />
          <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{post.views}</span>
          <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />{post.likes}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// ── Grid card (standard post card with tags + bookmark) ───────────────────────
interface GridCardProps { post: BlogPost; index: number; onClick: () => void; }

export const GridCard = ({ post, index, onClick }: GridCardProps) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 44 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1 } }) }}
    custom={index}
    whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,0,0,0.09)' }}
    onClick={onClick}
    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 cursor-pointer"
  >
    <div className="aspect-[4/3] relative overflow-hidden">
      <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
          {categoryLabel(post.category)}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <span className="mr-3">{formatDate(post.publishDate)}</span>
        <span>•</span>
        <span className="ml-3">{post.readTime} baca</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">{post.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
            <Tag className="w-3 h-3 mr-1" />{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full mr-2" />
          <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
        </div>
        <motion.button className="text-gray-400 hover:text-primary-600 transition-colors" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
          <Bookmark className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);
