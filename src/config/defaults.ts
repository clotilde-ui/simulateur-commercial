export const SECTORS = {
  saas: "SaaS / Tech",
  industrie: "Industrie",
  finance: "Finance / Banque",
  immo: "Immobilier",
  rh: "RH / Recrutement",
  ecom: "E-commerce",
  conseil: "Conseil / Services",
};

export const CHANNEL_SECTOR_DEFAULTS = {
  "google-ads": {
    saas: { cpc: 8, ctr: 4, conversionRate: 3.5, budget: 5000 },
    industrie: { cpc: 3, ctr: 4, conversionRate: 2.5, budget: 3000 },
    finance: { cpc: 12, ctr: 5, conversionRate: 2, budget: 8000 },
    immo: { cpc: 4, ctr: 5, conversionRate: 3, budget: 4000 },
    rh: { cpc: 5, ctr: 4.5, conversionRate: 3, budget: 3500 },
    ecom: { cpc: 1.2, ctr: 5, conversionRate: 2.5, budget: 2000 },
    conseil: { cpc: 6, ctr: 4, conversionRate: 3, budget: 6000 },
  },
  "meta-ads": {
    saas: { cpc: 2.5, ctr: 1.5, conversionRate: 2, budget: 4000 },
    industrie: { cpc: 1.5, ctr: 1.2, conversionRate: 1.5, budget: 2000 },
    finance: { cpc: 3.5, ctr: 1.2, conversionRate: 1.5, budget: 5000 },
    immo: { cpc: 1.8, ctr: 1.8, conversionRate: 2.5, budget: 3500 },
    rh: { cpc: 2, ctr: 1.5, conversionRate: 2, budget: 2500 },
    ecom: { cpc: 0.8, ctr: 2, conversionRate: 2.5, budget: 1500 },
    conseil: { cpc: 2, ctr: 1.4, conversionRate: 2, budget: 3500 },
  },
  "linkedin-ads": {
    saas: { cpc: 10, ctr: 0.6, conversionRate: 3, budget: 8000 },
    industrie: { cpc: 9, ctr: 0.5, conversionRate: 2, budget: 5000 },
    finance: { cpc: 14, ctr: 0.5, conversionRate: 2, budget: 10000 },
    immo: { cpc: 8, ctr: 0.5, conversionRate: 2, budget: 7000 },
    rh: { cpc: 12, ctr: 0.7, conversionRate: 3, budget: 6000 },
    ecom: { cpc: 9, ctr: 0.5, conversionRate: 1.5, budget: 4500 },
    conseil: { cpc: 11, ctr: 0.6, conversionRate: 2.5, budget: 9000 },
  },
  seo: {
    saas: { cpc: 55, ctr: 0, conversionRate: 30, budget: 2200 },
    industrie: { cpc: 45, ctr: 0, conversionRate: 25, budget: 1600 },
    finance: { cpc: 80, ctr: 0, conversionRate: 22, budget: 3000 },
    immo: { cpc: 50, ctr: 0, conversionRate: 28, budget: 2000 },
    rh: { cpc: 35, ctr: 0, conversionRate: 30, budget: 1800 },
    ecom: { cpc: 25, ctr: 0, conversionRate: 32, budget: 1400 },
    conseil: { cpc: 60, ctr: 0, conversionRate: 24, budget: 2400 },
  },
  "cold-email": {
    saas: { cpc: 70, ctr: 0, conversionRate: 12, budget: 1200 },
    industrie: { cpc: 65, ctr: 0, conversionRate: 10, budget: 900 },
    finance: { cpc: 120, ctr: 0, conversionRate: 8, budget: 1500 },
    immo: { cpc: 90, ctr: 0, conversionRate: 9, budget: 1100 },
    rh: { cpc: 40, ctr: 0, conversionRate: 14, budget: 850 },
    ecom: { cpc: 55, ctr: 0, conversionRate: 11, budget: 800 },
    conseil: { cpc: 85, ctr: 0, conversionRate: 10, budget: 1300 },
  },
};

export function getDefaultValues(channel, sector) {
  return CHANNEL_SECTOR_DEFAULTS[channel]?.[sector] ?? null;
}
