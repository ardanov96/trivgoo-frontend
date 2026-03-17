import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Car,
  Check,
  Coffee,
  List,
  MapPin,
  Plus,
  ShieldAlert,
  Tag,
  Trash,
  Upload,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';

import { useAuth } from "../../AuthContext";
import { agentProductService } from "../../services/agentProductService";
import { mediaService } from "../../services/mediaService";
import http from "../../services/http";
import VoucherSelector from "../../components/VoucherSelector";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
} from "../../types";

type CoverState =
  | { kind: "url"; url: string }
  | { kind: "file"; file: File; preview: string }
  | null;

type GalleryItem =
  | { kind: "url"; url: string }
  | { kind: "file"; file: File; preview: string };

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80";

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const MEDIA_PURPOSE = "agent-products";

const formatRupiah = (value: string) => {
  const numberString = value.replace(/\D/g, "");
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

type LatLng = { lat: number; lng: number };
const DEFAULT_CENTER: LatLng = { lat: -8.409518, lng: 115.188919 };

const AgentAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const galleryItemsRef = useRef<GalleryItem[]>([]);
  const coverStateRef = useRef<CoverState>(null);
  const markerPosRef = useRef<LatLng | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "IDR",
    location: "",
    lat: 0,
    lng: 0,
    image: "",
    features: [""],
    dailyCapacity: 10,
    blockedDates: [] as string[],
  });

  // ── NEW: Voucher state ───────────────────────────────────────────────────
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<number[]>([]);
  // ────────────────────────────────────────────────────────────────────────

  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [markerPos, setMarkerPos] = useState<LatLng | null>(null);
  const [coverState, setCoverState] = useState<CoverState>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, price: raw }));
  };

  const [tourDetails, setTourDetails] = useState({
    duration: "",
    groupSize: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Hard",
    ageRestriction: "",
    meetingPoint: "",
    inclusions: [""],
    exclusions: [""],
  });

  const [itineraryItems, setItineraryItems] = useState<ItineraryDay[]>([]);
  const [newDay, setNewDay] = useState<ItineraryDay>({
    day: 1,
    title: "",
    description: "",
    meals: [],
    accommodation: "",
  });

  const [stayDetails, setStayDetails] = useState({
    rooms: 1,
    bathrooms: 1,
    beds: 1,
    breakfastIncluded: false,
    amenities: [""],
  });

  const [carDetails, setCarDetails] = useState({
    seats: 4,
    transmission: "Automatic",
    luggage: 2,
    fuelPolicy: "Full to Full",
    year: new Date().getFullYear(),
    driver: false,
  });

  const [carList, setCarList] = useState<any[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  useEffect(() => { galleryItemsRef.current = galleryItems; }, [galleryItems]);
  useEffect(() => { coverStateRef.current = coverState; }, [coverState]);
  useEffect(() => { markerPosRef.current = markerPos; }, [markerPos]);

  const setMarkerAndRef = useCallback((pos: LatLng | null) => {
    setMarkerPos(pos);
    markerPosRef.current = pos;
  }, []);

  useEffect(() => {
    const hasLatLng =
      Number.isFinite(formData.lat) && Number.isFinite(formData.lng) &&
      (formData.lat !== 0 || formData.lng !== 0);
    if (hasLatLng) {
      const pos = { lat: formData.lat, lng: formData.lng };
      setMarkerAndRef(pos);
      setMapCenter(pos);
    }
  }, [formData.lat, formData.lng, setMarkerAndRef]);

  const isTour = user?.specialization === AgentSpecialization.TOUR;
  const isStay = user?.specialization === AgentSpecialization.STAY;
  const isTransport = user?.specialization === AgentSpecialization.TRANSPORT;

  const openCoverPicker = () => coverInputRef.current?.click();
  const openGalleryPicker = () => galleryInputRef.current?.click();

  const onPickCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverState((prev) => {
      if (prev?.kind === "file") URL.revokeObjectURL(prev.preview);
      const preview = URL.createObjectURL(file);
      return { kind: "file", file, preview };
    });
    setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    e.target.value = "";
  };

  const onPickGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems: GalleryItem[] = files.map((file) => ({
      kind: "file" as const,
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => {
      const target = prev[index];
      if (target?.kind === "file") URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.name || formData.description) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  const renderSubCategories = () => {
    const enumTourValues = Object.values(TourCategory);
    const tourExperienceTags = [
      "Family", "Honeymoon", "Solo Travel", "Healing",
      "Workation", "Adventure", "Cultural", "Culinary", "Eco Tourism"
    ];
    const tourOptions = Array.from(new Set([...enumTourValues, ...tourExperienceTags]));
    const options = isTour
      ? tourOptions
      : isStay
        ? Object.values(StayCategory)
        : Object.values(TransportCategory);

    return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {options.map((opt) => {
            const isSelected = selectedSubCategory === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedSubCategory(opt)}
                className={`group relative p-3 rounded-xl border-2 flex items-center justify-center text-center font-semibold text-xs transition-all duration-300 transform active:scale-95 ${
                  isSelected
                    ? "border-primary-600 bg-primary-50 text-primary-700 shadow-md ring-2 ring-primary-500/10"
                    : "border-gray-100 hover:border-primary-200 bg-white text-gray-600 hover:text-primary-600 shadow-sm"
                }`}
              >
                {opt}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-0.5 shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!id && user?.specialization) {
      if (user.specialization === AgentSpecialization.TOUR) setSelectedSubCategory(TourCategory.NATURE);
      if (user.specialization === AgentSpecialization.STAY) setSelectedSubCategory(StayCategory.HOTEL);
      if (user.specialization === AgentSpecialization.TRANSPORT) setSelectedSubCategory(TransportCategory.CAR_RENTAL);
      if (!markerPos) {
        setMarkerAndRef(DEFAULT_CENTER);
        setMapCenter(DEFAULT_CENTER);
      }
    }

    if (id) {
      setIsEditMode(true);
      (async () => {
        try {
          const product: AgentProduct = await agentProductService.getMyProduct(Number(id));

          if (product && product.owner_id === user?.id) {
            if (product.car_id) setSelectedCarId(product.car_id);

            const prodLat = Number(product.lat) || 0;
            const prodLng = Number(product.lng) || 0;
            const coordsValid = Number.isFinite(prodLat) && Number.isFinite(prodLng) && (prodLat !== 0 || prodLng !== 0);

            setFormData({
              name: product.name,
              description: product.description,
              price: product.price.toString(),
              currency: product.currency,
              location: product.location,
              image: (product as any).image || "",
              features: product.features || [""],
              dailyCapacity: product.daily_capacity || 10,
              blockedDates: (product as any).blocked_dates || [],
              lat: prodLat,
              lng: prodLng,
            });

            if (coordsValid) {
              const pos = { lat: prodLat, lng: prodLng };
              setMarkerPos(pos);
              setMapCenter(pos);
              markerPosRef.current = pos;
            }

            if (coordsValid && (!product.location || product.location.trim() === '')) {
              reverseGeocode({ lat: prodLat, lng: prodLng });
            }

            const coverUrl = (product as any).image || (product as any).image_url || "";
            setCoverState(coverUrl ? { kind: "url", url: coverUrl } : null);

            setGalleryItems(
              (product.images ?? []).map((img) => ({
                kind: "url" as const,
                url: img.url,
              }))
            );

            // ── NEW: Load voucher yang sudah terlampir ke product ini ────
            if (Array.isArray((product as any).vouchers)) {
              setSelectedVoucherIds(
                (product as any).vouchers
                  .map((v: any) => Number(v.id))
                  .filter(Boolean)
              );
            }
            // ─────────────────────────────────────────────────────────────

            if (product.details) {
              if (product.details.type === "tour") {
                setSelectedSubCategory(product.details.tourCategory);
                setTourDetails({
                  duration: product.details.duration,
                  groupSize: product.details.groupSize,
                  difficulty: product.details.difficulty,
                  ageRestriction: product.details.ageRestriction || "",
                  meetingPoint: product.details.meetingPoint,
                  inclusions: product.details.inclusions,
                  exclusions: product.details.exclusions,
                });
                setItineraryItems(product.details.itinerary);
              } else if (product.details.type === "stay") {
                setSelectedSubCategory(product.details.stayCategory);
                setStayDetails({
                  rooms: product.details.rooms,
                  bathrooms: product.details.bathrooms,
                  beds: product.details.beds,
                  breakfastIncluded: product.details.breakfastIncluded,
                  amenities: product.details.amenities?.[0]?.items || [""],
                });
              } else if (product.details.type === "car") {
                setSelectedSubCategory(product.details.transportCategory);
                setCarDetails({
                  seats: product.details.seats,
                  transmission: product.details.transmission,
                  luggage: product.details.luggage,
                  fuelPolicy: product.details.fuelPolicy,
                  year: product.details.year || new Date().getFullYear(),
                  driver: product.details.driver || false,
                });
                if ((product.details as any).car_id) {
                  setSelectedCarId((product.details as any).car_id);
                }
              }
            }
          } else {
            navigate("/agent/products");
          }
        } catch (err) {
          console.error(err);
          navigate("/agent/products");
        }
      })();
    }
  }, [id, user, navigate]);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const res = await http.get<any>('/cars');
        const list = res.data && res.data.data ? res.data.data : [];
        setCarList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to fetch cars', err);
        setCarList([]);
      }
    };
    if (user?.specialization === AgentSpecialization.TRANSPORT) loadCars();
  }, [user?.specialization]);

  const handleCarSelect = (carId: number) => {
    const car = carList.find((c) => c.id === carId);
    if (!car) return;
    setSelectedCarId(carId);
    setCarDetails({
      seats: car.seats || 4,
      transmission: car.transmission || 'Automatic',
      luggage: carDetails.luggage,
      fuelPolicy: carDetails.fuelPolicy,
      year: car.model_year ? parseInt(car.model_year) : new Date().getFullYear(),
      driver: carDetails.driver,
    });
    setFormData(prev => ({
      ...prev,
      name: `${car.brand} ${car.name}`.trim(),
      description: car.description || prev.description,
    }));
  };

  const searchAddress = async (query: string) => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'id,en' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const pos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setMarkerAndRef(pos);
        setMapCenter(pos);
        setFormData((prev) => ({ ...prev, location: result.display_name }));
      } else {
        Swal.fire({ title: 'Location not found', text: 'Please try a different search query', icon: 'warning', confirmButtonColor: '#0f172a' });
      }
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const reverseGeocode = async (pos: LatLng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`,
        { headers: { 'Accept-Language': 'id,en' } }
      );
      const data = await response.json();
      if (data && data.display_name) {
        setFormData((prev) => ({ ...prev, location: data.display_name }));
      }
    } catch (err) {
      console.error("Reverse geocode error", err);
    }
  };

  if (user?.verification_status !== VerificationStatus.VERIFIED) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-8">
            You must complete the agent verification process and be approved by an admin before you can add products.
          </p>
          <button
            onClick={() => navigate("/agent/verification")}
            className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-colors"
          >
            Go to Verification
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const removeFeature = (index: number) => setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));

  const handleListChange = (setter: any, list: string[], index: number, value: string) => {
    const updated = [...list];
    updated[index] = value;
    setter((prev: any) => {
      if (setter === setTourDetails) {
        const field = list === tourDetails.inclusions ? "inclusions" : "exclusions";
        return { ...prev, [field]: updated };
      }
      return { ...prev, amenities: updated };
    });
  };

  const addListItem = (setter: any, list: string[], field: string) =>
    setter((prev: any) => ({ ...prev, [field]: [...list, ""] }));
  const removeListItem = (setter: any, list: string[], field: string, index: number) =>
    setter((prev: any) => ({ ...prev, [field]: list.filter((_, i) => i !== index) }));

  const addItineraryDay = () => {
    if (!newDay.title || !newDay.description) return;
    setItineraryItems((prev) => [...prev, { ...newDay, day: prev.length + 1 }]);
    setNewDay({ day: itineraryItems.length + 2, title: "", description: "", meals: [], accommodation: "" });
  };

  const removeItineraryDay = (index: number) => {
    const updated = itineraryItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }));
    setItineraryItems(updated);
    setNewDay((prev) => ({ ...prev, day: updated.length + 1 }));
  };

  const toggleMeal = (meal: string) => {
    setNewDay((prev) => {
      const currentMeals = prev.meals || [];
      return currentMeals.includes(meal)
        ? { ...prev, meals: currentMeals.filter((m) => m !== meal) }
        : { ...prev, meals: [...currentMeals, meal] };
    });
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate && !formData.blockedDates.includes(newBlockedDate)) {
      setFormData((prev) => ({ ...prev, blockedDates: [...prev.blockedDates, newBlockedDate] }));
      setNewBlockedDate("");
    }
  };

  const removeBlockedDate = (date: string) =>
    setFormData((prev) => ({ ...prev, blockedDates: prev.blockedDates.filter((d) => d !== date) }));

  const coverPreviewSrc = useMemo(() => {
    if (!coverState) return "";
    return coverState.kind === "url" ? coverState.url : coverState.preview;
  }, [coverState]);

  const getCategoryId = () => {
    if (!user) return 1;
    if (user.specialization === AgentSpecialization.STAY) return 2;
    if (user.specialization === AgentSpecialization.TRANSPORT) return 3;
    return 1;
  };

  const buildDetails = (): ProductDetails | undefined => {
    if (!user) return undefined;
    if (user.specialization === AgentSpecialization.TOUR) {
      return {
        type: "tour",
        tourCategory: selectedSubCategory as TourCategory,
        duration: tourDetails.duration || "1 Day",
        groupSize: tourDetails.groupSize || "Flexible",
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
        type: "stay",
        stayCategory: selectedSubCategory as StayCategory,
        checkIn: "14:00",
        checkOut: "11:00",
        rooms: Number(stayDetails.rooms),
        bathrooms: Number(stayDetails.bathrooms),
        beds: Number(stayDetails.beds),
        breakfastIncluded: stayDetails.breakfastIncluded,
        amenities: [{ category: "General", items: stayDetails.amenities.filter((i) => i) }],
        rules: [],
      };
    }
    if (user.specialization === AgentSpecialization.TRANSPORT) {
      const details: any = {
        type: "car",
        transportCategory: selectedSubCategory as TransportCategory,
        transmission: carDetails.transmission as "Automatic" | "Manual",
        seats: Number(carDetails.seats),
        luggage: Number(carDetails.luggage),
        fuelPolicy: carDetails.fuelPolicy,
        driver: carDetails.driver,
        year: Number(carDetails.year),
        requirements: [],
      };
      if (selectedCarId) details.car_id = selectedCarId;
      return details;
    }
    return undefined;
  };

  const collectExistingUrls = () => {
    const currentCoverState = coverStateRef.current;
    const currentGalleryItems = galleryItemsRef.current;

    const coverUrl = !currentCoverState
      ? DEFAULT_COVER
      : currentCoverState.kind === "url"
        ? currentCoverState.url || DEFAULT_COVER
        : DEFAULT_COVER;

    const galleryUrls = currentGalleryItems
      .filter((x): x is { kind: "url"; url: string } => x.kind === "url")
      .map((x) => x.url);

    return { coverUrl, galleryUrls };
  };

  const uploadPendingMedia = async () => {
    const currentCoverState = coverStateRef.current;
    const currentGalleryItems = galleryItemsRef.current;

    const coverFile = currentCoverState?.kind === "file" ? currentCoverState.file : null;
    const galleryFiles = currentGalleryItems
      .filter((x): x is { kind: "file"; file: File; preview: string } => x.kind === "file")
      .map((x) => x.file);

    const [uploadedCoverUrl, uploadedGalleryUrls] = await Promise.all([
      coverFile ? mediaService.uploadOne(coverFile, MEDIA_PURPOSE) : Promise.resolve(""),
      galleryFiles.length ? mediaService.uploadMany(galleryFiles, MEDIA_PURPOSE) : Promise.resolve([] as string[]),
    ]);

    return { uploadedCoverUrl, uploadedGalleryUrls };
  };

  const handleSubmit = async (e: React.FormEvent | any) => {
    e.preventDefault();
    if (!user) return;

    const currentMarker = markerPosRef.current;
    const formDataValid =
      Number.isFinite(formData.lat) && Number.isFinite(formData.lng) &&
      (formData.lat !== 0 || formData.lng !== 0);
    const finalMarkerPos = currentMarker || (formDataValid ? { lat: formData.lat, lng: formData.lng } : null);

    if (!finalMarkerPos) {
      await Swal.fire({
        title: 'Location Required',
        text: 'Please set location marker on the map',
        icon: 'warning',
        confirmButtonColor: '#0f172a',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl' }
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: isEditMode ? 'Update Product?' : 'Create Product?',
      text: "Make sure all details are correct.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Yes, Save it!',
      customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl px-6 py-2.5', cancelButton: 'rounded-xl px-6 py-2.5' }
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmitting(true);
    Swal.fire({
      title: 'Uploading & Saving...',
      html: 'Please wait while we process your media files.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'rounded-3xl' }
    });

    try {
      const details = buildDetails();
      const categoryId = getCategoryId();

      const { coverUrl: existingCoverUrl, galleryUrls: existingGalleryUrls } = collectExistingUrls();
      const { uploadedCoverUrl, uploadedGalleryUrls } = await uploadPendingMedia();

      const finalCoverUrl = uploadedCoverUrl || existingCoverUrl;
      const finalGalleryUrls = uniq([...existingGalleryUrls, ...(uploadedGalleryUrls || [])]);

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
        lat: finalMarkerPos.lat,
        lng: finalMarkerPos.lng,
      } as any;

      if (isTransport) {
        payload.image_url = carList.find((c) => c.id === selectedCarId)?.image || payload.image_url;
        payload.images = [];
        if (selectedCarId) (payload as any).car_id = selectedCarId;
      }

      let savedProductId: number;
      if (isEditMode && id) {
        const updated = await agentProductService.updateProduct(Number(id), payload);
        savedProductId = updated.id;
      } else {
        const created = await agentProductService.createProduct(payload);
        savedProductId = created.id;
      }

      // ── NEW: Simpan relasi voucher ke endpoint khusus ──────────────
      if (savedProductId) {
        try {
          await agentProductService.setProductVouchers(savedProductId, selectedVoucherIds);
        } catch (voucherErr) {
          console.warn('[VOUCHER] Gagal menyimpan voucher relasi:', voucherErr);
          // Tidak memblokir sukses utama — cukup warn
        }
      }
      // ──────────────────────────────────────────────────────────────

      await Swal.fire({
        title: 'Success!',
        text: `Your product has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-3xl' }
      });

      navigate("/agent/products");
    } catch (error) {
      console.error('[SUBMIT ERROR]', error);

      // Tampilkan pesan error asli dari backend
      const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong while saving the product.';

      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong while saving the product.',
        icon: 'error',
        confirmButtonColor: '#0f172a',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center mb-8 sticky top-0 bg-gray-50 z-20 py-4">
        <button
          onClick={() => navigate("/agent/products")}
          className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Product" : "Add New Service"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditMode ? "Update your listing details." : "Create a compelling listing for your customers."}
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
              <> Save Changes <Check className="w-4 h-4 ml-2" /> </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Category & Basics */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">1</span>
              Category & Basics
            </h3>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Service Type</label>
            {renderSubCategories()}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Listing Title</label>
                <input
                  type="text" name="name" required
                  readOnly={isTransport && !!selectedCarId}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-medium ${isTransport && selectedCarId ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                  placeholder="e.g. 3D2N Nusa Penida Adventure"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                <div className="space-y-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
                    <input
                      type="text" name="location" required
                      className="w-full pl-10 pr-28 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white"
                      placeholder="Search location..."
                      value={formData.location}
                      onChange={handleChange}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchAddress(formData.location); } }}
                    />
                    <button type="button" onClick={() => searchAddress(formData.location)}
                      className="absolute right-2 top-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50">
                      Search
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <div className="h-64 w-full relative">
                      <LeafletMapComponent
                        center={mapCenter}
                        marker={markerPos}
                        onClickMap={(pos) => {
                          setMarkerAndRef(pos);
                          setMapCenter(pos);
                          reverseGeocode(pos);
                        }}
                        onMarkerDragEnd={async (pos) => {
                          setMarkerAndRef(pos);
                          setMapCenter(pos);
                          await reverseGeocode(pos);
                        }}
                      />
                    </div>
                    <div className="px-4 py-3 text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Search location or click map to set marker.</span>
                      <span className="font-mono">{markerPos ? `${markerPos.lat.toFixed(6)}, ${markerPos.lng.toFixed(6)}` : "-"}</span>
                    </div>
                  </div>

                  <div className={`px-4 py-3 text-xs flex items-center justify-between rounded-b-2xl ${
                    markerPosRef.current || (Number.isFinite(formData.lat) && Number.isFinite(formData.lng) && (formData.lat !== 0 || formData.lng !== 0))
                      ? 'bg-green-50 text-green-700 border-t border-green-200'
                      : 'bg-red-50 text-red-600 border-t border-red-200'
                  }`}>
                    <span className="font-bold">
                      {markerPos ? <>✓ Location marked</> : <>⚠️ Click map to set location</>}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea name="description" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white h-32 resize-none"
                  placeholder="Describe what makes this special..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 2. Specific Details */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">2</span>
              {isTour ? "Tour Specifics" : isStay ? "Property Details" : "Vehicle Specs"}
            </h3>

            {isTour && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. 3 Days" value={tourDetails.duration} onChange={(e) => setTourDetails({ ...tourDetails, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group Size</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. Max 10" value={tourDetails.groupSize} onChange={(e) => setTourDetails({ ...tourDetails, groupSize: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={tourDetails.difficulty} onChange={(e) => setTourDetails({ ...tourDetails, difficulty: e.target.value as any })}>
                      <option>Easy</option><option>Moderate</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meeting Point</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" placeholder="e.g. Hotel Lobby" value={tourDetails.meetingPoint} onChange={(e) => setTourDetails({ ...tourDetails, meetingPoint: e.target.value })} />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <List className="w-4 h-4 mr-2 text-primary-500" /> Itinerary
                  </label>
                  <div className="space-y-3 mb-4">
                    {itineraryItems.map((item, idx) => (
                      <div key={idx} className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold mr-3 border border-gray-200">{item.day}</div>
                        <div className="flex-1 text-sm font-medium">
                          <span className="font-bold">{item.title}</span>
                          {item.accommodation && <span className="text-xs text-gray-500 block">Stay: {item.accommodation}</span>}
                        </div>
                        <button onClick={() => removeItineraryDay(idx)} className="text-red-400 hover:text-red-600" type="button"><Trash className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <h5 className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-3">Day {itineraryItems.length + 1}</h5>
                    <input type="text" placeholder="Title (e.g. Island Hopping)" className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-2 text-sm" value={newDay.title} onChange={(e) => setNewDay({ ...newDay, title: e.target.value })} />
                    <textarea placeholder="Activity details..." className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-3 text-sm h-16 resize-none" value={newDay.description} onChange={(e) => setNewDay({ ...newDay, description: e.target.value })} />
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Accommodation</label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="e.g. Hilton Garden Inn" className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm" value={newDay.accommodation || ""} onChange={(e) => setNewDay({ ...newDay, accommodation: e.target.value })} />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Meals Included</label>
                      <div className="flex gap-2">
                        {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                          <button key={meal} type="button" onClick={() => toggleMeal(meal)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${newDay.meals?.includes(meal) ? "bg-orange-100 border-orange-200 text-orange-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                            {meal}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={addItineraryDay} className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Add to Itinerary</button>
                  </div>
                </div>
              </div>
            )}

            {isStay && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bedrooms</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={stayDetails.rooms} onChange={(e) => setStayDetails({ ...stayDetails, rooms: parseInt(e.target.value, 10) })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bathrooms</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={stayDetails.bathrooms} onChange={(e) => setStayDetails({ ...stayDetails, bathrooms: parseInt(e.target.value, 10) })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Beds</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={stayDetails.beds} onChange={(e) => setStayDetails({ ...stayDetails, beds: parseInt(e.target.value, 10) })} />
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input type="checkbox" id="bf" className="w-5 h-5 text-primary-600 rounded" checked={stayDetails.breakfastIncluded} onChange={(e) => setStayDetails({ ...stayDetails, breakfastIncluded: e.target.checked })} />
                  <label htmlFor="bf" className="ml-3 text-sm font-bold text-gray-700 flex items-center"><Coffee className="w-4 h-4 mr-2" /> Breakfast Included</label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities</label>
                  {stayDetails.amenities.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="e.g. Private Pool" value={item} onChange={(e) => handleListChange(setStayDetails, stayDetails.amenities, idx, e.target.value)} />
                      <button type="button" onClick={() => removeListItem(setStayDetails, stayDetails.amenities, "amenities", idx)} className="text-gray-300 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addListItem(setStayDetails, stayDetails.amenities, "amenities")} className="text-primary-600 text-xs font-bold hover:underline">+ Add Amenity</button>
                </div>
              </div>
            )}

            {isTransport && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehicle Year</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={carDetails.year} onChange={(e) => setCarDetails({ ...carDetails, year: parseInt(e.target.value, 10) })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Transmission</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={carDetails.transmission} onChange={(e) => setCarDetails({ ...carDetails, transmission: e.target.value })}>
                      <option>Automatic</option><option>Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seats</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={carDetails.seats} onChange={(e) => setCarDetails({ ...carDetails, seats: parseInt(e.target.value, 10) })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Luggage</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={carDetails.luggage} onChange={(e) => setCarDetails({ ...carDetails, luggage: parseInt(e.target.value, 10) })} />
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input type="checkbox" id="driver" className="w-5 h-5 text-primary-600 rounded" checked={carDetails.driver} onChange={(e) => setCarDetails({ ...carDetails, driver: e.target.checked })} />
                  <label htmlFor="driver" className="ml-3 text-sm font-bold text-gray-700 flex items-center"><User className="w-4 h-4 mr-2" /> Driver Included</label>
                </div>
              </div>
            )}
          </div>

          {/* 3. Pricing & Availability */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm">3</span>
              Pricing & Availability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price ({formData.currency})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">Rp.</span>
                  <input
                    type="text" name="price" required inputMode="numeric"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white font-bold text-lg"
                    placeholder="0"
                    value={formData.price ? formatRupiah(formData.price) : ""}
                    onChange={handlePriceChange}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Per {isTour ? "person" : isStay ? "night" : "day"}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Daily {isTour ? "Pax" : "Unit"} Capacity</label>
                <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white" value={formData.dailyCapacity} onChange={(e) => setFormData({ ...formData, dailyCapacity: parseInt(e.target.value, 10) })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Block Dates</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 px-4 py-2 rounded-xl border border-gray-200" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} />
                    <button type="button" onClick={handleAddBlockedDate} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition">Block</button>
                  </div>
                  {formData.blockedDates.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-xs font-bold text-red-700 mb-3">Blocked Dates ({formData.blockedDates.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.blockedDates.map((date) => {
                          const dateObj = new Date(date + 'T00:00:00');
                          const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
                          const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                          return (
                            <div key={date} className="flex items-center px-3 py-2 bg-white text-red-700 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-50 transition">
                              <Calendar className="w-3 h-3 mr-2" />
                              <span>{dayName} {formattedDate}</span>
                              <button type="button" onClick={() => removeBlockedDate(date)} className="ml-2 hover:text-red-900"><X className="w-3 h-3" /></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Voucher & Promo ── NEW SECTION ─────────────────────────────────── */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3 text-sm">4</span>
              Voucher & Promo
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Pilih voucher yang dapat digunakan customer saat memesan produk ini.
              Voucher berlaku sesuai syarat &amp; ketentuan masing-masing.
            </p>
            <VoucherSelector
              selectedIds={selectedVoucherIds}
              onChange={setSelectedVoucherIds}
            />
            {selectedVoucherIds.length > 0 && (
              <p className="mt-3 text-xs text-green-600 font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {selectedVoucherIds.length} voucher aktif untuk produk ini
              </p>
            )}
          </div>
          {/* ──────────────────────────────────────────────────────────────────────── */}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            {!isTransport && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Media</h3>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onPickCoverFile} />
                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickGalleryFiles} />

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cover Image</label>
                  <div onClick={openCoverPicker} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all bg-gray-50 relative overflow-hidden">
                    {coverPreviewSrc
                      ? <img src={coverPreviewSrc} className="w-full h-full object-cover" alt="cover" />
                      : <div className="text-center"><Upload className="w-6 h-6 mx-auto text-gray-400" /><span className="text-xs text-gray-500">Browse Cover</span></div>
                    }
                  </div>
                  {coverPreviewSrc && (
                    <button type="button" onClick={() => { setCoverState(null); setFormData((prev) => ({ ...prev, image: '' })); }} className="mt-2 text-xs font-bold text-red-500 hover:underline">
                      Remove Cover
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gallery</label>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryItems.map((item, idx) => {
                      const src = item.kind === 'url' ? item.url : item.preview;
                      return (
                        <div key={idx} className="h-16 rounded-lg overflow-hidden relative group">
                          <img src={src} className="w-full h-full object-cover" alt="gallery" />
                          <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="w-3 h-3" /></button>
                        </div>
                      );
                    })}
                    <div onClick={openGalleryPicker} className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-50">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {isTransport && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-primary-500" />Select Vehicle
                </h3>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  value={selectedCarId ?? ''}
                  onChange={(e) => { const val = parseInt(e.target.value, 10); if (!isNaN(val)) handleCarSelect(val); }}
                >
                  <option value="" disabled>-- Select a vehicle --</option>
                  {carList.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.brand} {car.name} {car.model_year ? `(${car.model_year})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCarId && (() => {
                  const car = carList.find(c => c.id === selectedCarId);
                  return car ? (
                    <div className="mt-4 p-4 rounded-xl border border-primary-100">
                      {car.image && <img src={car.image} alt={car.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Highlights</h3>
              <div className="space-y-2">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs" value={feature} onChange={(e) => handleFeatureChange(idx, e.target.value)} />
                    <button onClick={() => removeFeature(idx)} className="text-red-400" type="button"><Trash className="w-3 h-3" /></button>
                  </div>
                ))}
                <button type="button" onClick={addFeature} className="text-primary-600 text-xs font-bold hover:underline">+ Add Highlight</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Leaflet Map Component ───────────────────────────────────────────────────

interface MapComponentProps {
  center: LatLng;
  marker: LatLng | null;
  onClickMap: (pos: LatLng) => void;
  onMarkerDragEnd: (pos: LatLng) => void;
}

const customMarkerIcon = new L.DivIcon({
  html: `
    <div class="relative w-full h-full flex flex-col items-center justify-end group">
      <div class="absolute bottom-4 w-12 h-12 bg-primary-500 rounded-full opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
      <div class="relative z-10 w-10 h-10 flex items-center justify-center bg-primary-600 rounded-full shadow-xl border-2 border-white text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="relative w-1.5 h-4 bg-primary-600 border-x border-white -mt-1 z-0"></div>
      <div class="absolute -bottom-1 w-5 h-1.5 bg-black/30 blur-[2px] rounded-[50%]"></div>
    </div>
  `,
  className: "bg-transparent border-none",
  iconSize: [48, 60],
  iconAnchor: [24, 60],
});

const MapClickHandler: React.FC<{ onClickMap: (pos: LatLng) => void }> = ({ onClickMap }) => {
  useMapEvents({ click: (e) => onClickMap({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
};

const MapCenterUpdater: React.FC<{ center: LatLng; hasMarker: boolean }> = ({ center, hasMarker }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], hasMarker ? 15 : map.getZoom());
  }, [center, hasMarker, map]);
  return null;
};

const LeafletMapComponent: React.FC<MapComponentProps> = ({ center, marker, onClickMap, onMarkerDragEnd }) => {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={marker ? 15 : 11}
        style={{ width: "100%", height: "100%", zIndex: 10 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onClickMap={onClickMap} />
        <MapCenterUpdater center={center} hasMarker={!!marker} />
        {marker && (
          <Marker
            position={[marker.lat, marker.lng]}
            draggable
            icon={customMarkerIcon}
            eventHandlers={{ dragend: (e) => { const ll = e.target.getLatLng(); onMarkerDragEnd({ lat: ll.lat, lng: ll.lng }); } }}
          />
        )}
      </MapContainer>
      <div className="absolute top-4 left-4 z-[20] pointer-events-none">
        {marker ? (
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
              Location Pinned
            </span>
            <span className="text-xs font-mono font-medium text-gray-700">Lat: {marker.lat.toFixed(6)}</span>
            <span className="text-xs font-mono font-medium text-gray-700">Lng: {marker.lng.toFixed(6)}</span>
            <p className="text-[9px] text-gray-400 mt-1">Drag marker to adjust</p>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100 flex items-center text-primary-600 animate-pulse">
            <span className="text-xs font-bold uppercase tracking-wider">Select a location on map</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentAddProduct;
