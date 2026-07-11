export interface Testimonial {
  name: string;
  quote: string;
  occasion: string;
  product: string;
}

// Gerçek müşteri yorumları geldikçe buraya eklenir.
export const TESTIMONIALS: Testimonial[] = [];
