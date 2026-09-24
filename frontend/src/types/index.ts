export type UserRole = 'USER' | 'ADMIN';

export interface UserPreferences {
  budgetRange: string;
  travelStyle: string;
  foodPreferences: string[];
  preferredActivities: string[];
  preferredDestinations: string[];
  walkingTolerance: string;
  accommodationPreference: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attraction {
  name: string;
  description: string;
  estimatedTimeHours: number;
  costUsd: number;
  category: string;
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  country: string;
  region: string;
  description: string;
  category: string;
  averageDailyCost: number;
  currency: string;
  popularSeason: string;
  topAttractions: Attraction[];
  tags: string[];
  coordinates: { lat: number; lng: number };
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
}

export interface TripActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  durationHours?: number;
  estimatedCostUsd?: number;
  category?: string;
  tips?: string;
}

export interface DayPlan {
  day: number;
  date?: string;
  theme: string;
  activities: TripActivity[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  estimatedDailyCostUsd?: number;
}

export interface TripCitation {
  title: string;
  source: string;
  snippet?: string;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  destinationSlug?: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: number;
  currency: string;
  travelers: number;
  interests: string[];
  preferences?: Record<string, any>;
  itinerary: DayPlan[];
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalEstimatedCostUsd?: number;
  aiGenerated?: boolean;
  citations?: TripCitation[];
  notes?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  location: string;
  temperatureC: number;
  temperatureF: number;
  condition: string;
  humidity: number;
  windSpeedKmh: number;
  forecast: Array<{
    day: string;
    tempHighC: number;
    tempLowC: number;
    condition: string;
  }>;
}

export interface Review {
  _id: string;
  userId: string;
  destinationId: string;
  rating: number;
  comment: string;
  userName?: string;
  visitedDate?: string;
  createdAt: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  destinationId: Destination;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: TripCitation[];
  memoryExtracted?: Record<string, any>;
  timestamp: string;
}
