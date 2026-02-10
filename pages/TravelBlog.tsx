import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Heart,
  MapPin,
  Search,
  Share2,
  Tag,
  User,
  BookOpen,
  Compass,
  Camera,
  TrendingUp,
  Star,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  isFeatured?: boolean;
  isTrending?: boolean;
}

interface BlogCategory {
  id: string;
  name: string;
  count: number;
  icon: React.ElementType;
}

const TravelBlog: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 9;

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'The Hidden Temples of Bali: Beyond the Tourist Trail',
      excerpt: 'Discover ancient temples tucked away in Bali\'s lush jungles, away from the crowds and commercialization.',
      content: '',
      author: {
        name: 'Ahmad Wijaya',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'Travel Writer & Photographer'
      },
      category: 'destinations',
      tags: ['Bali', 'Temples', 'Culture', 'Hidden Gems'],
      readTime: '8 min',
      publishDate: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      views: 2543,
      likes: 187,
      comments: 42,
      isFeatured: true,
      isTrending: true,
    },
    {
      id: 2,
      title: 'Sustainable Travel in Raja Ampat: How to Visit Responsibly',
      excerpt: 'A comprehensive guide to exploring one of the world\'s most biodiverse marine ecosystems while minimizing your impact.',
      content: '',
      author: {
        name: 'Maya Sari',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: 'Marine Conservationist'
      },
      category: 'guides',
      tags: ['Raja Ampat', 'Sustainable', 'Marine Life', 'Eco-Tourism'],
      readTime: '12 min',
      publishDate: '2024-03-12',
      image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800&q=80',
      views: 1876,
      likes: 234,
      comments: 38,
      isTrending: true,
    },
    {
      id: 3,
      title: 'Komodo Dragons Up Close: A Photographer\'s Journey',
      excerpt: 'Capturing the legendary Komodo dragons in their natural habitat - tips, stories, and breathtaking photos.',
      content: '',
      author: {
        name: 'Budi Santoso',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        role: 'Wildlife Photographer'
      },
      category: 'photography',
      tags: ['Komodo', 'Wildlife', 'Photography', 'Indonesia'],
      readTime: '10 min',
      publishDate: '2024-03-10',
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
      views: 3210,
      likes: 312,
      comments: 56,
      isFeatured: true,
    },
    {
      id: 4,
      title: 'The Ultimate Yogyakarta Itinerary: 5 Days of Culture & Adventure',
      excerpt: 'From Borobudur at sunrise to Javanese culinary adventures, this itinerary covers it all.',
      content: '',
      author: {
        name: 'Siti Nurhaliza',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        role: 'Cultural Guide'
      },
      category: 'guides',
      tags: ['Yogyakarta', 'Itinerary', 'Culture', 'Food'],
      readTime: '15 min',
      publishDate: '2024-03-08',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
      views: 1895,
      likes: 156,
      comments: 29,
    },
    {
      id: 5,
      title: 'Tokyo on a Budget: How to Experience Luxury for Less',
      excerpt: 'Pro tips for enjoying Tokyo\'s best experiences without breaking the bank.',
      content: '',
      author: {
        name: 'Kenji Tanaka',
        avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
        role: 'Budget Travel Expert'
      },
      category: 'guides',
      tags: ['Tokyo', 'Budget', 'Luxury', 'Tips'],
      readTime: '7 min',
      publishDate: '2024-03-05',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      views: 2789,
      likes: 198,
      comments: 41,
    },
    {
      id: 6,
      title: 'Seoul\'s Secret Cafés: Where Locals Actually Go',
      excerpt: 'Beyond the tourist spots - discover Seoul\'s hidden café culture loved by locals.',
      content: '',
      author: {
        name: 'Ji-eun Kim',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        role: 'Food & Culture Writer'
      },
      category: 'culture',
      tags: ['Seoul', 'Cafés', 'Local', 'Food'],
      readTime: '6 min',
      publishDate: '2024-03-03',
      image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
      views: 2156,
      likes: 178,
      comments: 33,
    },
    {
      id: 7,
      title: 'Hiking Mount Bromo: What They Don\'t Tell You',
      excerpt: 'Essential tips and honest insights for tackling Indonesia\'s most iconic volcano.',
      content: '',
      author: {
        name: 'Rizky Pratama',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        role: 'Adventure Guide'
      },
      category: 'adventure',
      tags: ['Mount Bromo', 'Hiking', 'Adventure', 'Volcano'],
      readTime: '11 min',
      publishDate: '2024-02-28',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
      views: 3421,
      likes: 267,
      comments: 48,
      isTrending: true,
    },
    {
      id: 8,
      title: 'Singapore\'s Hawker Centers: A Food Lover\'s Paradise',
      excerpt: 'Navigating Singapore\'s legendary street food scene like a pro.',
      content: '',
      author: {
        name: 'Wei Chen',
        avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
        role: 'Food Critic'
      },
      category: 'culture',
      tags: ['Singapore', 'Food', 'Hawker', 'Street Food'],
      readTime: '9 min',
      publishDate: '2024-02-25',
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80',
      views: 1987,
      likes: 145,
      comments: 27,
    },
    {
      id: 9,
      title: 'Kyoto\'s Bamboo Forest: Finding Peace in the Crowds',
      excerpt: 'How to experience the magic of Arashiyama without the tourist masses.',
      content: '',
      author: {
        name: 'Haruki Yamamoto',
        avatar: 'https://randomuser.me/api/portraits/men/38.jpg',
        role: 'Zen & Wellness Writer'
      },
      category: 'destinations',
      tags: ['Kyoto', 'Bamboo', 'Wellness', 'Japan'],
      readTime: '8 min',
      publishDate: '2024-02-22',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      views: 2310,
      likes: 189,
      comments: 35,
    },
    {
      id: 10,
      title: 'Hong Kong Skyline: Photography Tips for Perfect Shots',
      excerpt: 'Master the art of capturing Hong Kong\'s iconic skyline at golden hour.',
      content: '',
      author: {
        name: 'Ming Lee',
        avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
        role: 'Cityscape Photographer'
      },
      category: 'photography',
      tags: ['Hong Kong', 'Photography', 'Skyline', 'Tips'],
      readTime: '7 min',
      publishDate: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      views: 2678,
      likes: 203,
      comments: 39,
    },
    {
      id: 11,
      title: 'Bangkok Night Markets: Beyond Chatuchak',
      excerpt: 'Discover lesser-known night markets offering authentic Thai experiences.',
      content: '',
      author: {
        name: 'Chaya Wong',
        avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
        role: 'Market Explorer'
      },
      category: 'culture',
      tags: ['Bangkok', 'Markets', 'Night Life', 'Shopping'],
      readTime: '6 min',
      publishDate: '2024-02-18',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
      views: 1895,
      likes: 134,
      comments: 24,
    },
    {
      id: 12,
      title: 'Scuba Diving in Bunaken: Underwater Wonderland',
      excerpt: 'Exploring one of the world\'s best dive sites in North Sulawesi.',
      content: '',
      author: {
        name: 'Dewa Putra',
        avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
        role: 'Dive Master'
      },
      category: 'adventure',
      tags: ['Bunaken', 'Diving', 'Marine Life', 'Adventure'],
      readTime: '13 min',
      publishDate: '2024-02-15',
      image: 'https://images.unsplash.com/photo-1514999037859-b486988734f1?auto=format&fit=crop&w=800&q=80',
      views: 2987,
      likes: 245,
      comments: 43,
    },
  ];

  const trendingPosts = blogPosts.filter(post => post.isTrending);
  const featuredPosts = blogPosts.filter(post => post.isFeatured);

  // Filter posts based on category and search query
  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-600/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-[0.2em] mb-6 uppercase border border-white/20">
              Travel Stories
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              Explore Through <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-amber-200">
                Our Stories
              </span>
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Dive deep into travel experiences, expert guides, and hidden gems across Indonesia and Asia.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, destinations, or topics..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
                  Editor's Picks
                </h2>
                <p className="text-gray-600">Featured stories handpicked by our editors</p>
              </div>
              <div className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors cursor-pointer">
                View All Featured <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 cursor-pointer"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-600 text-white">
                        Featured
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-sm text-gray-500 mr-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.publishDate)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime} read
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{post.author.name}</div>
                          <div className="text-sm text-gray-500">{post.author.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-500">
                        <button className="flex items-center hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span className="ml-1 text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="ml-1 text-sm">{post.comments}</span>
                        </button>
                        <button className="hover:text-gray-700 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <button className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm hover:shadow-md transition-shadow">
                View All Featured <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending Now */}
      {trendingPosts.length > 0 && (
        <div className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
                    Trending Now
                  </h2>
                  <p className="text-gray-600">Most popular articles this week</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                        Trending
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="mr-3">{formatDate(post.publishDate)}</span>
                      <span>•</span>
                      <span className="ml-3">{post.readTime} read</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Blog Grid */}
      <div className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
              Latest Stories
            </h2>
            <p className="text-gray-600">Browse all our travel articles and guides</p>
          </div>

          {currentPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.id}`)}
                    className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
                          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="mr-3">{formatDate(post.publishDate)}</span>
                        <span>•</span>
                        <span className="ml-3">{post.readTime} read</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                        </div>
                        <button className="text-gray-400 hover:text-primary-600 transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-16 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, and pages around current
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis
                      const showEllipsis = index < array.length - 1 && array[index + 1] - page > 1;
                      return (
                        <React.Fragment key={page}>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-full font-bold ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                          {showEllipsis && (
                            <span className="text-gray-400 px-2">...</span>
                          )}
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TravelBlog;