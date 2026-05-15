export type Profile =
  | "ARE&M Admin"
  | "Regional Sales Manager"
  | "Dealer"
  | "Industrial Account Manager"
  | "Industrial Customer";

export const PROFILES: Profile[] = [
  "ARE&M Admin",
  "Regional Sales Manager",
  "Dealer",
  "Industrial Account Manager",
  "Industrial Customer",
];

// Real-looking product images (Unsplash car battery photography — stable URLs)
const IMG = {
  amaron4w: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&q=80&auto=format&fit=crop",
  amaron2w: "https://images.unsplash.com/photo-1609205807107-454f1c4cd8d8?w=600&q=80&auto=format&fit=crop",
  powerzone: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&q=80&auto=format&fit=crop",
  industrial: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=600&q=80&auto=format&fit=crop",
  freshpack: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?w=600&q=80&auto=format&fit=crop",
};

export const PRODUCTS = [
  { id: "P1", name: "Amaron Pro 35Ah 4W", brand: "Amaron", type: "4W", spec: "12V / 35Ah · 55B24L", price: 4200, stock: "In Stock", image: IMG.amaron4w },
  { id: "P2", name: "Amaron Hi-Life 2.5Ah 2W", brand: "Amaron", type: "2W", spec: "12V / 2.5Ah · ETZ4", price: 980, stock: "In Stock", image: IMG.amaron2w },
  { id: "P3", name: "Powerzone 45Ah 4W", brand: "Powerzone", type: "4W", spec: "12V / 45Ah · DIN44", price: 3600, stock: "Low Stock", image: IMG.powerzone },
  { id: "P4", name: "Amaron FreshPack 60Ah 4W", brand: "Amaron", type: "4W", spec: "12V / 60Ah · DIN66", price: 5100, stock: "In Stock", image: IMG.freshpack },
  { id: "P5", name: "Powerzone 2.5Ah 2W", brand: "Powerzone", type: "2W", spec: "12V / 2.5Ah", price: 820, stock: "In Stock", image: IMG.amaron2w },
  { id: "P6", name: "Quanta 150Ah Industrial", brand: "Quanta", type: "Industrial", spec: "12V / 150Ah · SMF VRLA", price: 18500, stock: "In Stock", image: IMG.industrial },
  { id: "P7", name: "Amaron Hi-Way 100Ah CV", brand: "Amaron", type: "4W", spec: "12V / 100Ah · Commercial", price: 8900, stock: "In Stock", image: IMG.amaron4w },
  { id: "P8", name: "AmaronVolt 200Ah Industrial", brand: "AmaronVolt", type: "Industrial", spec: "12V / 200Ah · Telecom", price: 22000, stock: "In Stock", image: IMG.industrial },
  { id: "P9", name: "Amaron Black 80Ah 4W", brand: "Amaron", type: "4W", spec: "12V / 80Ah · DIN80", price: 6800, stock: "In Stock", image: IMG.amaron4w },
  { id: "P10", name: "Powerzone Hummer 65Ah 4W", brand: "Powerzone", type: "4W", spec: "12V / 65Ah", price: 4900, stock: "Low Stock", image: IMG.powerzone },
  { id: "P11", name: "Amaron Pro 9Ah 2W", brand: "Amaron", type: "2W", spec: "12V / 9Ah · Bullet", price: 1450, stock: "In Stock", image: IMG.amaron2w },
  { id: "P12", name: "Quanta 100Ah Industrial", brand: "Quanta", type: "Industrial", spec: "12V / 100Ah · UPS", price: 14200, stock: "In Stock", image: IMG.industrial },
];

export const DEALER_ORDERS = [
  { id: "ORD-7821", date: "12 May 2026", items: "Amaron Pro 35Ah ×12, Powerzone 45Ah ×6", total: 72000, status: "Dispatched", eta: "16 May 2026" },
  { id: "ORD-7798", date: "08 May 2026", items: "Amaron Hi-Life ×40", total: 39200, status: "Delivered", eta: "11 May 2026" },
  { id: "ORD-7765", date: "03 May 2026", items: "Amaron FreshPack ×8", total: 40800, status: "Delivered", eta: "06 May 2026" },
  { id: "ORD-7740", date: "28 Apr 2026", items: "Powerzone 2.5Ah ×60", total: 49200, status: "Delivered", eta: "01 May 2026" },
  { id: "ORD-7712", date: "21 Apr 2026", items: "Amaron Pro 35Ah ×20", total: 84000, status: "Delivered", eta: "24 Apr 2026" },
  { id: "ORD-7855", date: "14 May 2026", items: "Quanta 150Ah ×2", total: 37000, status: "Processing", eta: "19 May 2026" },
  { id: "ORD-7860", date: "15 May 2026", items: "Amaron Hi-Life ×24", total: 23520, status: "Processing", eta: "20 May 2026" },
  { id: "ORD-7872", date: "16 May 2026", items: "Amaron Black 80Ah ×6", total: 40800, status: "Processing", eta: "21 May 2026" },
  { id: "ORD-7690", date: "14 Apr 2026", items: "Amaron Hi-Way 100Ah ×4", total: 35600, status: "Delivered", eta: "17 Apr 2026" },
  { id: "ORD-7651", date: "07 Apr 2026", items: "Powerzone Hummer 65Ah ×10", total: 49000, status: "Delivered", eta: "10 Apr 2026" },
];

const dealersList = ["Sharma Auto Parts", "KK Batteries", "Sri Venkat Electricals", "Mehta Motors", "Raja Battery House", "Patel Power Hub", "Reddy Auto Care", "Singh Battery Mart", "Krishna Motors", "Verma Electricals"];
const locations = ["Delhi", "Pune", "Chennai", "Ahmedabad", "Hyderabad", "Mumbai", "Bengaluru", "Jaipur", "Kolkata", "Lucknow"];
const statuses = ["Dispatched", "Processing", "Delivered"];
const skuList = [
  "Amaron Pro 35Ah ×30", "Powerzone 45Ah ×20", "Amaron FreshPack ×15", "Amaron Hi-Life ×80",
  "Quanta 150Ah ×4", "Powerzone 2.5Ah ×100", "Amaron Black 80Ah ×8", "AmaronVolt 200Ah ×3",
  "Amaron Hi-Way 100Ah ×6", "Powerzone Hummer 65Ah ×12",
];

export const REGIONAL_ORDERS = Array.from({ length: 32 }, (_, i) => {
  const day = 16 - (i % 16);
  return {
    dealer: dealersList[i % dealersList.length],
    location: locations[i % locations.length],
    id: `ORD-${9012 - i}`,
    skus: skuList[i % skuList.length],
    value: 40000 + ((i * 7919) % 110000),
    status: statuses[i % statuses.length],
    date: `${String(day).padStart(2, "0")} May 2026`,
    category: i % 3 === 0 ? "Industrial" : i % 2 === 0 ? "4W" : "2W",
  };
});

export const SKU_SELLTHROUGH = [
  { sku: "Amaron Pro 35Ah", units: 1840, type: "auto" },
  { sku: "Amaron Hi-Life 2.5Ah", units: 2120, type: "auto" },
  { sku: "Powerzone 45Ah", units: 920, type: "auto" },
  { sku: "Amaron FreshPack 60Ah", units: 640, type: "auto" },
  { sku: "Powerzone 2.5Ah", units: 1450, type: "auto" },
  { sku: "Amaron Black 80Ah", units: 720, type: "auto" },
  { sku: "Amaron Hi-Way 100Ah", units: 530, type: "auto" },
  { sku: "Quanta 150Ah", units: 312, type: "industrial" },
  { sku: "AmaronVolt 200Ah", units: 188, type: "industrial" },
];

export const REGIONS = [
  { name: "NCR", activity: "high" },
  { name: "Maharashtra", activity: "medium" },
  { name: "Tamil Nadu", activity: "high" },
  { name: "Karnataka", activity: "medium" },
  { name: "Telangana", activity: "low" },
  { name: "Gujarat", activity: "high" },
  { name: "West Bengal", activity: "medium" },
];

export const STOCKOUT_ALERTS = [
  { dealer: "Sharma Auto Parts", region: "NCR", sku: "Amaron Pro 35Ah", days: 9, current: 14, reorder: 40 },
  { dealer: "KK Batteries", region: "Maharashtra", sku: "Powerzone 45Ah", days: 12, current: 22, reorder: 30 },
  { dealer: "Sri Venkat Electricals", region: "Tamil Nadu", sku: "Powerzone 45Ah", days: 8, current: 11, reorder: 35 },
  { dealer: "Raja Battery House", region: "Telangana", sku: "Quanta 150Ah", days: 18, current: 4, reorder: 8 },
  { dealer: "Mehta Motors", region: "Gujarat", sku: "Amaron Hi-Life 2.5Ah", days: 6, current: 18, reorder: 60 },
  { dealer: "Patel Power Hub", region: "Maharashtra", sku: "Amaron Black 80Ah", days: 14, current: 7, reorder: 20 },
];

export const SITES = [
  { id: "NCR-041", name: "Tower Site NCR-041", location: "Delhi", units: 6, status: "Critical", lifeLeft: 22, lastInspection: "02 Apr 2026" },
  { id: "NCR-089", name: "Tower Site NCR-089", location: "Gurgaon", units: 4, status: "Good", lifeLeft: 78, lastInspection: "28 Apr 2026" },
  { id: "MH-117", name: "Tower Site MH-117", location: "Pune", units: 4, status: "At Risk", lifeLeft: 45, lastInspection: "15 Apr 2026" },
  { id: "MH-203", name: "Tower Site MH-203", location: "Mumbai", units: 8, status: "Good", lifeLeft: 82, lastInspection: "30 Apr 2026" },
  { id: "KA-052", name: "Tower Site KA-052", location: "Bengaluru", units: 6, status: "At Risk", lifeLeft: 38, lastInspection: "20 Apr 2026" },
  { id: "TN-018", name: "Tower Site TN-018", location: "Chennai", units: 5, status: "Good", lifeLeft: 71, lastInspection: "25 Apr 2026" },
];

export const SITE_UNITS: Record<string, { unitId: string; model: string; installed: string; ageMonths: number; lifeUsed: number; status: string }[]> = {
  "NCR-041": [
    { unitId: "U-NCR041-01", model: "Quanta 150Ah", installed: "10 Mar 2021", ageMonths: 62, lifeUsed: 88, status: "Critical" },
    { unitId: "U-NCR041-02", model: "Quanta 150Ah", installed: "10 Mar 2021", ageMonths: 62, lifeUsed: 91, status: "Critical" },
    { unitId: "U-NCR041-03", model: "Quanta 150Ah", installed: "10 Mar 2021", ageMonths: 62, lifeUsed: 79, status: "At Risk" },
    { unitId: "U-NCR041-04", model: "AmaronVolt 200Ah", installed: "22 Aug 2022", ageMonths: 45, lifeUsed: 64, status: "At Risk" },
    { unitId: "U-NCR041-05", model: "AmaronVolt 200Ah", installed: "22 Aug 2022", ageMonths: 45, lifeUsed: 70, status: "At Risk" },
    { unitId: "U-NCR041-06", model: "Quanta 150Ah", installed: "05 Jan 2023", ageMonths: 40, lifeUsed: 52, status: "Good" },
  ],
  "NCR-089": [
    { unitId: "U-NCR089-01", model: "Quanta 150Ah", installed: "15 Sep 2024", ageMonths: 20, lifeUsed: 22, status: "Good" },
    { unitId: "U-NCR089-02", model: "Quanta 150Ah", installed: "15 Sep 2024", ageMonths: 20, lifeUsed: 24, status: "Good" },
    { unitId: "U-NCR089-03", model: "AmaronVolt 200Ah", installed: "15 Sep 2024", ageMonths: 20, lifeUsed: 19, status: "Good" },
    { unitId: "U-NCR089-04", model: "AmaronVolt 200Ah", installed: "15 Sep 2024", ageMonths: 20, lifeUsed: 21, status: "Good" },
  ],
  "MH-117": [
    { unitId: "U-MH117-01", model: "Quanta 150Ah", installed: "08 Jul 2023", ageMonths: 34, lifeUsed: 58, status: "At Risk" },
    { unitId: "U-MH117-02", model: "Quanta 150Ah", installed: "08 Jul 2023", ageMonths: 34, lifeUsed: 61, status: "At Risk" },
    { unitId: "U-MH117-03", model: "AmaronVolt 200Ah", installed: "08 Jul 2023", ageMonths: 34, lifeUsed: 49, status: "Good" },
    { unitId: "U-MH117-04", model: "AmaronVolt 200Ah", installed: "08 Jul 2023", ageMonths: 34, lifeUsed: 54, status: "At Risk" },
  ],
  "MH-203": [
    { unitId: "U-MH203-01", model: "Quanta 150Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 18, status: "Good" },
    { unitId: "U-MH203-02", model: "Quanta 150Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 20, status: "Good" },
    { unitId: "U-MH203-03", model: "Quanta 150Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 17, status: "Good" },
    { unitId: "U-MH203-04", model: "AmaronVolt 200Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 19, status: "Good" },
    { unitId: "U-MH203-05", model: "AmaronVolt 200Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 22, status: "Good" },
    { unitId: "U-MH203-06", model: "AmaronVolt 200Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 18, status: "Good" },
    { unitId: "U-MH203-07", model: "Quanta 150Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 21, status: "Good" },
    { unitId: "U-MH203-08", model: "Quanta 150Ah", installed: "20 Nov 2024", ageMonths: 18, lifeUsed: 19, status: "Good" },
  ],
  "KA-052": [
    { unitId: "U-KA052-01", model: "Quanta 150Ah", installed: "12 Feb 2023", ageMonths: 39, lifeUsed: 62, status: "At Risk" },
    { unitId: "U-KA052-02", model: "Quanta 150Ah", installed: "12 Feb 2023", ageMonths: 39, lifeUsed: 65, status: "At Risk" },
    { unitId: "U-KA052-03", model: "AmaronVolt 200Ah", installed: "12 Feb 2023", ageMonths: 39, lifeUsed: 58, status: "At Risk" },
  ],
  "TN-018": [
    { unitId: "U-TN018-01", model: "Quanta 150Ah", installed: "10 Aug 2024", ageMonths: 21, lifeUsed: 28, status: "Good" },
    { unitId: "U-TN018-02", model: "Quanta 150Ah", installed: "10 Aug 2024", ageMonths: 21, lifeUsed: 30, status: "Good" },
  ],
};

export const ALL_FLEET_SITES = [
  { customer: "Indus Towers", site: "NCR-041", location: "Delhi", units: 6, status: "Critical", days: 43, risk: "Critical" },
  { customer: "Indus Towers", site: "NCR-089", location: "Gurgaon", units: 4, status: "Good", days: 17, risk: "Low" },
  { customer: "Indus Towers", site: "MH-117", location: "Pune", units: 4, status: "At Risk", days: 30, risk: "High" },
  { customer: "Indus Towers", site: "MH-203", location: "Mumbai", units: 8, status: "Good", days: 15, risk: "Low" },
  { customer: "BSNL", site: "BSNL-TN-22", location: "Chennai", units: 12, status: "At Risk", days: 38, risk: "Medium" },
  { customer: "BSNL", site: "BSNL-KA-09", location: "Bengaluru", units: 10, status: "Critical", days: 51, risk: "Critical" },
  { customer: "Hitachi UPS Solutions", site: "HUS-MH-04", location: "Mumbai", units: 6, status: "Good", days: 12, risk: "Low" },
  { customer: "Hitachi UPS Solutions", site: "HUS-DL-02", location: "Delhi", units: 8, status: "At Risk", days: 27, risk: "High" },
  { customer: "Indus Towers", site: "KA-052", location: "Bengaluru", units: 6, status: "At Risk", days: 33, risk: "High" },
  { customer: "Indus Towers", site: "TN-018", location: "Chennai", units: 5, status: "Good", days: 14, risk: "Low" },
  { customer: "BSNL", site: "BSNL-AP-11", location: "Hyderabad", units: 9, status: "At Risk", days: 41, risk: "Medium" },
  { customer: "Hitachi UPS Solutions", site: "HUS-KA-07", location: "Bengaluru", units: 4, status: "Good", days: 9, risk: "Low" },
];

export const CONTRACTS = [
  { id: "INDT-2024-001", product: "Quanta 150Ah", rate: 17500, total: 500, consumed: 312, remaining: 188, start: "16 Aug 2024", end: "15 Aug 2026", customer: "Indus Towers" },
  { id: "INDT-2024-002", product: "AmaronVolt 200Ah", rate: 22000, total: 200, consumed: 180, remaining: 20, start: "01 Jul 2024", end: "30 Jun 2026", customer: "Indus Towers" },
  { id: "BSNL-2025-014", product: "Quanta 150Ah", rate: 17200, total: 800, consumed: 410, remaining: 390, start: "10 Jan 2025", end: "09 Jan 2027", customer: "BSNL" },
  { id: "HUS-2025-007", product: "AmaronVolt 200Ah", rate: 21800, total: 300, consumed: 95, remaining: 205, start: "20 Mar 2025", end: "19 Mar 2027", customer: "Hitachi UPS Solutions" },
  { id: "INDT-2025-009", product: "Quanta 100Ah", rate: 14200, total: 400, consumed: 120, remaining: 280, start: "01 Feb 2025", end: "31 Jan 2027", customer: "Indus Towers" },
  { id: "BSNL-2025-021", product: "AmaronVolt 200Ah", rate: 21500, total: 250, consumed: 60, remaining: 190, start: "15 Apr 2025", end: "14 Apr 2027", customer: "BSNL" },
];

export const fmtINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

export const fmtINRLakh = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return "₹" + n.toLocaleString("en-IN");
};
