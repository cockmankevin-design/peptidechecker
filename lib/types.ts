export interface Vendor {
  slug: string;
  name: string;
  description: string;
  trustScore: number;
  coaStatus: string;
  testingMethod: string;
  shippingSpeed: string;
  avgPrice: string;
  affiliateUrl: string;
  productsCarried: string[];
  founded: string;
  location: string;
  /** True until an independent lab result actually backs this vendor's numbers.
      Nothing marked sample may be presented to a reader as a real test result. */
  sampleData?: boolean;
}

export interface ProductVendor {
  vendorSlug: string;
  vendorName: string;
  price: string;
  purity: number;
  shippingDays: string;
  trustScore: number;
  testSlug?: string;
  affiliateUrl: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  description: string;
  commonUses: string[];
  startingPrice: string;
  image?: string;
  vendors: ProductVendor[];
  sampleData?: boolean;
}

export interface TestResult {
  slug: string;
  vendor: string;
  vendorSlug: string;
  peptide: string;
  peptideSlug: string;
  lab: string;
  hplcPurity: number;
  massSpecConfirmed: boolean;
  endotoxinTested: boolean;
  lotNumber: string;
  dateTested: string;
  passed: boolean;
  reportPdf?: string;
  sampleData?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
}
