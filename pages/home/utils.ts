export const getSubCategoryValue = (details: any): string => {
  if (!details) return '';
  return (details.tourCategory || details.stayCategory || details.transportCategory || '').toLowerCase();
};

export const formatLocation = (location: string): string => {
  if (!location) return '';
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  const cleaned = parts.filter(
    (p) =>
      !/\d/.test(p) &&
      !['indonesia', 'jawa', 'java'].includes(p.toLowerCase()) &&
      !/^dusun/i.test(p) && !/^rt/i.test(p) && !/^rw/i.test(p) &&
      !/^jalan/i.test(p) && !/^jl/i.test(p) && !/^gg/i.test(p) && !/^gang/i.test(p)
  );
  return cleaned.slice(-3).join(', ');
};
