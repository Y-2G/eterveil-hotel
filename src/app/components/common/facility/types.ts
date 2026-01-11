export interface GalleryImage {
  url: string;
  alt: string;
}

export interface FacilityDetails {
  hours: string;
  location: string;
  reservation: string;
}

export interface Facility {
  id: string;
  badge: string;
  floorLabel: string;
  title: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  galleryImages: GalleryImage[];
  details: FacilityDetails;
  highlights: string[];
  note: string;
}

export interface FacilitiesData {
  facilities: Facility[];
}
