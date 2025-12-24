import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Check,
  Coffee,
  List,
  MapPin,
  Plus,
  ShieldAlert,
  Trash,
  Upload,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { agentProductService } from '../../services/agentProductService';
import { mediaService } from '../../services/mediaService';
import {
  AgentProduct,
  AgentProductPayload,
  AgentSpecialization,
  ItineraryDay,
  ProductDetails,
  StayCategory,
  TourCategory,
  TransportCategory,
  VerificationStatus,
} from '../../types';

type CoverState =
  | { kind: 'url'; url: string }
  | { kind: 'file'; file: File; preview: string }
  | null;

type GalleryItem = { kind: 'url'; url: string } | { kind: 'file'; file: File; preview: string };

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const MEDIA_PURPOSE = 'agent-products';

const AgentAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    location: '',
    image: '',
    features: [''],
    dailyCapacity: 10,
    blockedDates: [] as string[],
  });

  const [coverState, setCoverState] = useState<CoverState>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const [tourDetails, setTourDetails] = useState({
    duration: '',
    groupSize: '',
    difficulty: 'Easy' as 'Easy' | 'Moderate' | 'Hard',
    ageRestriction: '',
    meetingPoint: '',
    inclusions: [''],
    exclusions: [''],
  });

  const [itineraryItems, setItineraryItems] = useState<ItineraryDay[]>([]);
  const [newDay, setNewDay] = useState<ItineraryDay>({
    day: 1,
    title: '',
    description: '',
    meals: [],
    accommodation: '',
  });

  const [stayDetails, setStayDetails] = useState({
    rooms: 1,
    bathrooms: 1,
    beds: 1,
    breakfastIncluded: false,
    amenities: [''],
  });

  const [carDetails, setCarDetails] = useState({
    seats: 4,
    transmission: 'Automatic',
    luggage: 2,
    fuelPolicy: 'Full to Full',
    year: new Date().getFullYear(),
    driver: false,
  });

  useEffect(() => {
    return () => {
      if (coverState?.kind === 'file') URL.revokeObjectURL(coverState.preview);
      for (const item of galleryItems) {
        if (item.kind === 'file') URL.revokeObjectURL(item.preview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTour = user?.specialization === AgentSpecialization.TOUR;
  const isStay = user?.specialization === AgentSpecialization.STAY;
  const isTransport = user?.specialization === AgentSpecialization.TRANSPORT;

  const renderSubCategories = () => {
    const options = isTour
      ? Object.values(TourCategory)
      : isStay
      ? Object.values(StayCategory)
      : Object.values(TransportCategory);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {options.map((opt) => (
          <div
            key={opt}
            onClick={() => setSelectedSubCategory(opt)}
            className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-center text-center font-bold text-sm transition-all ${
              selectedSubCategory === opt
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-100 hover:border-gray-200 text-gray-600'
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!id && user?.specialization) {
      if (user.specialization === AgentSpecialization.TOUR) {
        setSelectedSubCategory(TourCategory.NATURE);
      }
      if (user.specialization === AgentSpecialization.STAY) {
        setSelectedSubCategory(StayCategory.HOTEL);
      }
      if (user.specialization === AgentSpecialization.TRANSPORT) {
        setSelectedSubCategory(TransportCategory.CAR_RENTAL);
      }
    }

    if (id) {
      setIsEditMode(true);
      (async () => {
        try {
          const product: AgentProduct = await agentProductService.getMyProduct(Number(id));

          if (product && product.owner_id === user?.id) {
            setFormData({
              name: product.name,
              description: product.description,
              price: product.price.toString(),
              currency: product.currency,
              location: product.location,
              image: product.image,
              features: product.features || [''],
              dailyCapacity: product.daily_capacity || 10,
              blockedDates: (product as any).blocked_dates || [],
            });

            setCoverState(product.image ? { kind: 'url', url: product.image } : null);

            setGalleryItems(
              (product.images ?? []).map((img) => ({
                kind: 'url' as const,
                url: img.url,
              })),
            );

            if (product.details) {
              if (product.details.type === 'tour') {
                setSelectedSubCategory(product.details.tourCategory);
                setTourDetails({
                  duration: product.details.duration,
                  groupSize: product.details.groupSize,
                  difficulty: product.details.difficulty,
                  ageRestriction: product.details.ageRestriction || '',
                  meetingPoint: product.details.meetingPoint,
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,
                });
                setItineraryItems(product.details.itinerary);
              } else if (product.details.type === 'stay') {
                setSelectedSubCategory(product.details.stayCategory);
                setStayDetails({
                  rooms: product.details.rooms,
                  bathrooms: product.details.bathrooms,
                  beds: product.details.beds,
                  breakfastIncluded: product.details.breakfastIncluded,
                  amenities: product.details.amenities?.[0]?.items || [''],
                });
              } else if (product.details.type === 'car') {
                setSelectedSubCategory(product.details.transportCategory);
                setCarDetails({
                  seats: product.details.seats,
                  transmission: product.details.transmission,
                  luggage: product.details.luggage,
                  fuelPolicy: product.details.fuelPolicy,
                  year: product.details.year || new Date().getFullYear(),
                  driver: product.details.driver || false,
                });
              }
            }
          } else {
            navigate('/agent/products');
          }
        } catch (err) {
          console.error(err);
          navigate('/agent/products');
        }
      })();
    }
  }, [id, user, navigate]);

  if (user?.verification_status !== VerificationStatus.VERIFIED) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-8">
            You must complete the agent verification process and be approved by an admin before you
            can add products.
          </p>
          <button
            onClick={() => navigate('/agent/verification')}
            className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-colors"
          >
            Go to Verification
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleListChange = (setter: any, list: string[], index: number, value: string) => {
    const updated = [...list];
    updated[index] = value;

    setter((prev: any) => {
      if (setter === setTourDetails) {
        const field = list === tourDetails.inclusions ? 'inclusions' : 'exclusions';
        return { ...prev, [field]: updated };
      }
      return { ...prev, amenities: updated };
    });
  };

  const addListItem = (setter: any, list: string[], field: string) => {
    setter((prev: any) => ({ ...prev, [field]: [...list, ''] }));
  };

  const removeListItem = (setter: any, list: string[], field: string, index: number) => {
    setter((prev: any) => ({
      ...prev,
      [field]: list.filter((_, i) => i !== index),
    }));
  };

  const addItineraryDay = () => {
    if (!newDay.title || !newDay.description) return;
    setItineraryItems((prev) => [...prev, { ...newDay, day: prev.length + 1 }]);
    setNewDay({
      day: itineraryItems.length + 2,
      title: '',
      description: '',
      meals: [],
      accommodation: '',
    });
  };

  const removeItineraryDay = (index: number) => {
    const updated = itineraryItems
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, day: i + 1 }));
    setItineraryItems(updated);
    setNewDay((prev) => ({ ...prev, day: updated.length + 1 }));
  };

  const toggleMeal = (meal: string) => {
    setNewDay((prev) => {
      const currentMeals = prev.meals || [];
      if (currentMeals.includes(meal)) {
        return { ...prev, meals: currentMeals.filter((m) => m !== meal) };
      }
      return { ...prev, meals: [...currentMeals, meal] };
    });
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate && !formData.blockedDates.includes(newBlockedDate)) {
      setFormData((prev) => ({
        ...prev,
        blockedDates: [...prev.blockedDates, newBlockedDate],
      }));
      setNewBlockedDate('');
    }
  };

  const removeBlockedDate = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== date),
    }));
  };

  // MEDIA
  const openCoverPicker = () => coverInputRef.current?.click();
  const openGalleryPicker = () => galleryInputRef.current?.click();

  const onPickCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverState((prev) => {
      if (prev?.kind === 'file') URL.revokeObjectURL(prev.preview);
      return prev;
    });

    const preview = URL.createObjectURL(file);
    setCoverState({ kind: 'file', file, preview });
    setFormData((prev) => ({ ...prev, image: preview }));
    e.target.value = '';
  };

  const onPickGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems: GalleryItem[] = files.map((file) => ({
      kind: 'file',
      file,
      preview: URL.createObjectURL(file),
    }));

    setGalleryItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => {
      const target = prev[index];
      if (target?.kind === 'file') URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const coverPreviewSrc = useMemo(() => {
    if (!coverState) return '';
    return coverState.kind === 'url' ? coverState.url : coverState.preview;
  }, [coverState]);

  // ====== helpers submit (refactor) ======
  const getCategoryId = () => {
    if (!user) return 1;
    if (user.specialization === AgentSpecialization.STAY) return 2;
    if (user.specialization === AgentSpecialization.TRANSPORT) return 4;
    return 1; // TOUR default
  };

  const buildDetails = (): ProductDetails | undefined => {
    if (!user) return undefined;

    if (user.specialization === AgentSpecialization.TOUR) {
      return {
        type: 'tour',
        tourCategory: selectedSubCategory as TourCategory,
        duration: tourDetails.duration || '1 Day',
        groupSize: tourDetails.groupSize || 'Flexible',
        difficulty: tourDetails.difficulty,
        meetingPoint: tourDetails.meetingPoint,
        ageRestriction: tourDetails.ageRestriction,
        itinerary: itineraryItems,
        inclusions: tourDetails.inclusions.filter((i) => i),
        exclusions: tourDetails.exclusions.filter((i) => i),
      };
    }

    if (user.specialization === AgentSpecialization.STAY) {
      return {
        type: 'stay',
        stayCategory: selectedSubCategory as StayCategory,
        checkIn: '14:00',
        checkOut: '11:00',
        rooms: Number(stayDetails.rooms),
        bathrooms: Number(stayDetails.bathrooms),
        beds: Number(stayDetails.beds),
        breakfastIncluded: stayDetails.breakfastIncluded,
        amenities: [
          {
            category: 'General',
            items: stayDetails.amenities.filter((i) => i),
          },
        ],
        rules: [],
      };
    }

    if (user.specialization === AgentSpecialization.TRANSPORT) {
      return {
        type: 'car',
        transportCategory: selectedSubCategory as TransportCategory,
        transmission: carDetails.transmission as 'Automatic' | 'Manual',
        seats: Number(carDetails.seats),
        luggage: Number(carDetails.luggage),
        fuelPolicy: carDetails.fuelPolicy,
        driver: carDetails.driver,
        year: Number(carDetails.year),
        requirements: [],
      };
    }

    return undefined;
  };

  const collectExistingUrls = () => {
    const coverUrl = !coverState
      ? DEFAULT_COVER
      : coverState.kind === 'url'
      ? coverState.url || DEFAULT_COVER
      : DEFAULT_COVER;

    const galleryUrls = galleryItems
      .filter((x): x is { kind: 'url'; url: string } => x.kind === 'url')
      .map((x) => x.url);

    return { coverUrl, galleryUrls };
  };

  const uploadPendingMedia = async () => {
    const coverFile = coverState?.kind === 'file' ? coverState.file : null;

    const galleryFiles = galleryItems
      .filter((x): x is { kind: 'file'; file: File; preview: string } => x.kind === 'file')
      .map((x) => x.file);

    // upload cover & gallery
    const [uploadedCoverUrl, uploadedGalleryUrls] = await Promise.all([
      coverFile ? mediaService.uploadOne(coverFile, MEDIA_PURPOSE) : Promise.resolve(''),
      galleryFiles.length
        ? mediaService.uploadMany(galleryFiles, MEDIA_PURPOSE)
        : Promise.resolve([] as string[]),
    ]);

    return { uploadedCoverUrl, uploadedGalleryUrls };
  };

  const handleSubmit = async (e: React.FormEvent | any) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // 1) build details & base
      const details = buildDetails();
      const categoryId = getCategoryId();

      // 2) existing URLs (yang sudah ada, tidak perlu upload)
      const { coverUrl: existingCoverUrl, galleryUrls: existingGalleryUrls } =
        collectExistingUrls();

      // 3) upload yang baru (file)
      const { uploadedCoverUrl, uploadedGalleryUrls } = await uploadPendingMedia();

      const finalCoverUrl = uploadedCoverUrl || existingCoverUrl;
      const finalGalleryUrls = uniq([...existingGalleryUrls, ...(uploadedGalleryUrls || [])]);

      // 4) send create/update payload (sesuaikan field: image + images)
      const payload: AgentProductPayload = {
        category_id: categoryId,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        currency: formData.currency,
        location: formData.location,
        image_url: finalCoverUrl,
        images: finalGalleryUrls,
        features: formData.features.filter((f) => f.trim() !== ''),
        details,
        daily_capacity: Number(formData.dailyCapacity),
        blocked_dates: formData.blockedDates,
      };

      if (isEditMode && id) {
        await agentProductService.updateProduct(Number(id), payload);
      } else {
        await agentProductService.createProduct(payload);
      }

      navigate('/agent/products');
    } catch (error) {
      console.error(error);
      // TODO: toast error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center mb-8 sticky top-0 bg-gray-50 z-20 py-4">
        <button
          onClick={() => navigate('/agent/products')}
          className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Service'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditMode
              ? 'Update your listing details.'
              : 'Create a compelling listing for your customers.'}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              <>
                Save Changes <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - MAIN FORM */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Category & Basic Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">
                1
              </span>
              Category & Basics
            </h3>

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Service Type
            </label>
            {renderSubCategories()}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Listing Title
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium"
                  placeholder="e.g. 3D2N Nusa Penida Adventure"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white"
                    placeholder="e.g. Ubud, Bali"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white h-32 resize-none"
                  placeholder="Describe what makes this special..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* 2. Specific Details */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">
                2
              </span>
              {isTour ? 'Tour Specifics' : isStay ? 'Property Details' : 'Vehicle Specs'}
            </h3>

            {/* TOUR */}
            {isTour && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      placeholder="e.g. 3 Days"
                      value={tourDetails.duration}
                      onChange={(e) =>
                        setTourDetails({
                          ...tourDetails,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Group Size
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      placeholder="e.g. Max 10"
                      value={tourDetails.groupSize}
                      onChange={(e) =>
                        setTourDetails({
                          ...tourDetails,
                          groupSize: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={tourDetails.difficulty}
                      onChange={(e) =>
                        setTourDetails({
                          ...tourDetails,
                          difficulty: e.target.value as any,
                        })
                      }
                    >
                      <option>Easy</option>
                      <option>Moderate</option>
                      <option>Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Meeting Point
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      placeholder="e.g. Hotel Lobby"
                      value={tourDetails.meetingPoint}
                      onChange={(e) =>
                        setTourDetails({
                          ...tourDetails,
                          meetingPoint: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Itinerary */}
                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <List className="w-4 h-4 mr-2 text-primary-500" /> Itinerary
                  </label>

                  <div className="space-y-3 mb-4">
                    {itineraryItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold mr-3 border border-gray-200">
                          {item.day}
                        </div>
                        <div className="flex-1 text-sm font-medium">
                          <span className="font-bold">{item.title}</span>
                          {item.accommodation && (
                            <span className="text-xs text-gray-500 block">
                              Stay: {item.accommodation}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItineraryDay(idx)}
                          className="text-red-400 hover:text-red-600"
                          type="button"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <h5 className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-3">
                      Day {itineraryItems.length + 1}
                    </h5>

                    <input
                      type="text"
                      placeholder="Title (e.g. Island Hopping)"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-2 text-sm"
                      value={newDay.title}
                      onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                    />

                    <textarea
                      placeholder="Activity details..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-3 text-sm h-16 resize-none"
                      value={newDay.description}
                      onChange={(e) => setNewDay({ ...newDay, description: e.target.value })}
                    ></textarea>

                    <div className="mb-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Accommodation
                      </label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g. Hilton Garden Inn"
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm"
                          value={newDay.accommodation || ''}
                          onChange={(e) =>
                            setNewDay({
                              ...newDay,
                              accommodation: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Meals Included
                      </label>
                      <div className="flex gap-2">
                        {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                          <button
                            key={meal}
                            type="button"
                            onClick={() => toggleMeal(meal)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              newDay.meals?.includes(meal)
                                ? 'bg-orange-100 border-orange-200 text-orange-700'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {meal}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addItineraryDay}
                      className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700"
                    >
                      Add to Itinerary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAY */}
            {isStay && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={stayDetails.rooms}
                      onChange={(e) =>
                        setStayDetails({
                          ...stayDetails,
                          rooms: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={stayDetails.bathrooms}
                      onChange={(e) =>
                        setStayDetails({
                          ...stayDetails,
                          bathrooms: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Beds
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={stayDetails.beds}
                      onChange={(e) =>
                        setStayDetails({
                          ...stayDetails,
                          beds: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="bf"
                    className="w-5 h-5 text-primary-600 rounded"
                    checked={stayDetails.breakfastIncluded}
                    onChange={(e) =>
                      setStayDetails({
                        ...stayDetails,
                        breakfastIncluded: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="bf"
                    className="ml-3 text-sm font-bold text-gray-700 flex items-center"
                  >
                    <Coffee className="w-4 h-4 mr-2" /> Breakfast Included
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Amenities
                  </label>
                  {stayDetails.amenities.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        placeholder="e.g. Private Pool"
                        value={item}
                        onChange={(e) =>
                          handleListChange(
                            setStayDetails,
                            stayDetails.amenities,
                            idx,
                            e.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(setStayDetails, stayDetails.amenities, 'amenities', idx)
                        }
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(setStayDetails, stayDetails.amenities, 'amenities')}
                    className="text-primary-600 text-xs font-bold hover:underline"
                  >
                    + Add Amenity
                  </button>
                </div>
              </div>
            )}

            {/* TRANSPORT */}
            {isTransport && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Vehicle Year
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={carDetails.year}
                      onChange={(e) =>
                        setCarDetails({
                          ...carDetails,
                          year: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Transmission
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={carDetails.transmission}
                      onChange={(e) =>
                        setCarDetails({
                          ...carDetails,
                          transmission: e.target.value,
                        })
                      }
                    >
                      <option>Automatic</option>
                      <option>Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Seats
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={carDetails.seats}
                      onChange={(e) =>
                        setCarDetails({
                          ...carDetails,
                          seats: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Luggage
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                      value={carDetails.luggage}
                      onChange={(e) =>
                        setCarDetails({
                          ...carDetails,
                          luggage: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="driver"
                    className="w-5 h-5 text-primary-600 rounded"
                    checked={carDetails.driver}
                    onChange={(e) => setCarDetails({ ...carDetails, driver: e.target.checked })}
                  />
                  <label
                    htmlFor="driver"
                    className="ml-3 text-sm font-bold text-gray-700 flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" /> Driver Included
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 3. Pricing & Availability */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm">
                3
              </span>
              Pricing & Availability
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Price ({formData.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-bold text-lg"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Per {isTour ? 'person' : isStay ? 'night' : 'day'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Daily {isTour ? 'Pax' : 'Unit'} Capacity
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white"
                  value={formData.dailyCapacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dailyCapacity: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Block Dates
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="date"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddBlockedDate}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold"
                  >
                    Block
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.blockedDates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100"
                    >
                      <Calendar className="w-3 h-3 mr-1" /> {date}
                      <button
                        type="button"
                        onClick={() => removeBlockedDate(date)}
                        className="ml-2 hover:bg-red-200 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - MEDIA & SUMMARY */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Media</h3>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickCoverFile}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickGalleryFiles}
            />

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Cover Image
              </label>

              <div
                onClick={openCoverPicker}
                className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all bg-gray-50 relative overflow-hidden"
              >
                {coverPreviewSrc ? (
                  <img src={coverPreviewSrc} className="w-full h-full object-cover" alt="cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto text-gray-400" />
                    <span className="text-xs text-gray-500">Browse Cover</span>
                  </div>
                )}
              </div>

              {coverPreviewSrc ? (
                <button
                  type="button"
                  onClick={() => {
                    setCoverState((prev) => {
                      if (prev?.kind === 'file') URL.revokeObjectURL(prev.preview);
                      return null;
                    });
                    setFormData((prev) => ({ ...prev, image: '' }));
                  }}
                  className="mt-2 text-xs font-bold text-red-500 hover:underline"
                >
                  Remove Cover
                </button>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Gallery
              </label>

              <div className="grid grid-cols-3 gap-2">
                {galleryItems.map((item, idx) => {
                  const src = item.kind === 'url' ? item.url : item.preview;
                  return (
                    <div key={idx} className="h-16 rounded-lg overflow-hidden relative group">
                      <img src={src} className="w-full h-full object-cover" alt="gallery" />
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                <div
                  onClick={openGalleryPicker}
                  className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Highlights</h3>
              <div className="space-y-2">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs"
                      value={feature}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    />
                    <button
                      onClick={() => removeFeature(idx)}
                      className="text-red-400"
                      type="button"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-primary-600 text-xs font-bold hover:underline"
                >
                  + Add Highlight
                </button>
              </div>
            </div>

            <div className="mt-6 text-[11px] text-gray-400">
              * Cover/Gallery akan di-upload saat kamu klik Save.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentAddProduct;
