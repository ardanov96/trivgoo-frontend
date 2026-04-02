import { ArrowRight, Lightbulb, Map, MapPin, Send, Sparkles, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../src/hooks/useLangNavigate';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { generateTripPlan } from '../services/geminiService';
import { Product } from '../types';
import { encodeId } from '../utils/hashids';
import { generateSlug } from '../utils/slugify';

const AITripPlanner: React.FC = () => {
  const { t } = useTranslation();
  const { langPath } = useLangNavigate();
  const [userStory, setUserStory] = useState('');
  const [itinerary, setItinerary] = useState<string>('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Suggestions diambil dari translation agar ikut bahasa aktif
  const SUGGESTIONS = [
    t('ai_planner.suggestion_1'),
    t('ai_planner.suggestion_2'),
    t('ai_planner.suggestion_3'),
    t('ai_planner.suggestion_4'),
  ];

  useEffect(() => {
    // mockService.getProducts().then(setAllProducts);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStory.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setItinerary('');
    setRecommendedProducts([]);

    const result = await generateTripPlan(userStory, allProducts);

    setItinerary(result.itinerary);

    if (result.recommendedProductIds.length > 0) {
      const matches = allProducts.filter((p) => result.recommendedProductIds.includes(p.id));
      setRecommendedProducts(matches);
    }

    setIsLoading(false);
  };

  const useSuggestion = (text: string) => {
    setUserStory(text);
  };

  return (
    <>
      <SEO title="AI Trip Planner | Trivgoo" />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4 animate-bounce">
            <Sparkles className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            {t('ai_planner.title')}
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4">
            {t('ai_planner.desc1')}
            {t('ai_planner.desc2')}
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12 relative z-10">
          <div className="p-1 bg-gradient-to-r from-primary-400 via-purple-500 to-orange-500"></div>
          <div className="p-6 md:p-8">
            <form onSubmit={handleGenerate}>
              <div className="relative">
                <textarea
                  className="w-full h-40 p-5 pr-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-base md:text-lg text-gray-700 bg-gray-50 focus:bg-white transition-all shadow-inner"
                  placeholder={t('ai_planner.placeholder')}
                  value={userStory}
                  onChange={(e) => setUserStory(e.target.value)}
                ></textarea>
                <div className="absolute bottom-4 right-4">
                  <button
                    type="submit"
                    disabled={isLoading || !userStory.trim()}
                    className="flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t('ai_planner.thinking')}
                      </>
                    ) : (
                      <>
                        {t('ai_planner.generate')} <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Suggestions */}
            {!hasSearched && (
              <div className="mt-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" /> {t('ai_planner.try_prompts')}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => useSuggestion(suggestion)}
                      className="text-left text-xs md:text-sm px-4 py-2 bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 rounded-xl transition-all text-gray-600 hover:text-primary-700"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left: Itinerary Text */}
            <div className={`lg:col-span-2 ${isLoading ? 'opacity-50' : ''}`}>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 h-full">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center">
                  <Map className="w-6 h-6 mr-3 text-primary-500" /> {t('ai_planner.your_itinerary')}
                </h3>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                    <div className="h-32 bg-gray-50 rounded-xl animate-pulse mt-6"></div>
                  </div>
                ) : (
                  <div className="prose prose-teal max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
                    <ReactMarkdown>{itinerary}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recommended Products */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-orange-500 fill-current" /> {t('ai_planner.recommended')}
                </h3>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-32 animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : recommendedProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={langPath(`/product/${encodeId(product.id)}/${generateSlug(product.name)}`)}
                        className="block mt-4 text-center text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 py-2 rounded-lg transition-colors border border-primary-200"
                      >
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.rating > 4.5 && (
                              <div className="absolute top-1 right-1 bg-white/90 backdrop-blur rounded px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
                                ⭐ {product.rating}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center text-[10px] text-gray-500 mb-1">
                              <MapPin className="w-3 h-3 mr-1" /> {product.location}
                            </div>
                            <h4 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-sm font-bold text-primary-700">
                                {product.currency} {product.price}
                              </span>
                              <span className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">
                      {t('ai_planner.no_match')}
                      {t('ai_planner.options')}
                    </p>
                    <Link
                      to={langPath('/explore')}
                      className="inline-block mt-4 text-primary-600 font-bold text-sm hover:underline"
                    >
                      {t('common.see_all')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AITripPlanner;
