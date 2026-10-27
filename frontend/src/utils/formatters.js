// Standard PKR Price and Date formatters across the application

export const formatPKR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'PKR 0';
  return `PKR ${Number(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 0,
  })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCarImageUrl = (car) => {
  const fallback = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80';
  if (!car) return fallback;
  if (typeof car === 'string') return car;
  if (!car.images || !Array.isArray(car.images) || car.images.length === 0) return fallback;
  const primary = car.images.find((img) => typeof img === 'object' && img?.isPrimary) || car.images[0];
  const url = typeof primary === 'string' ? primary : (primary?.url || primary?.filePath);
  if (!url || typeof url !== 'string') return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};


export const getTodayDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateStr = (baseDateStr) => {
  const d = baseDateStr ? new Date(`${baseDateStr}T00:00:00`) : new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

