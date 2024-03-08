export interface ResultFilters {
  date?: string;
  departureTime?: "12a-6a" | "6a-12p" | "12p-6p" | "6p-12a";
  sortByAsc?: "fare" | "departureDate" | "arrivalDate";
}

export interface LambdaEvent {
  originCode: string;
  destinationCode: string;
  dateString: string;
}

export interface LambdaResponse {
  statusCode: number;
  body: Body;
}

export interface Body {
  message: string;
  timestamp: string;
  event: LambdaEvent;
  response: Response;
  reason: string;
}

export interface Response {
  trip: Trip[];
  reverseTrip: Trip[];
}

export interface Trip {
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureDateTime: string;
  arrivalDateTime: string;
  legs: Leg[];
  reservableAccommodations: ReservableAccommodation[];
}

export interface Leg {
  destination: Location;
  origin: Location;
  travelService: TravelService;
  elapsedTime: string;
  id: string;
  isBorderCross: boolean;
  isCancelled: boolean;
  isRestricted: boolean;
  salesOverrideFlag: boolean;
  numberOfStops: number;
  isSelfTransfer: boolean;
  elapsedSeconds: number;
}

export interface Location {
  schedule: Schedule;
  code: string;
  name: string;
}

export interface Schedule {
  arrivalDateTime?: string;
  departureDateTime?: string;
}

export interface TravelService {
  amenities: Amenity[];
  carrier: string;
  name: string;
  number: string;
  type: string;
  isAcela: boolean;
}

export interface Amenity {
  code: string;
  name: string;
}

export interface ReservableAccommodation {
  accommodationFare: Fare;
  isAdditionalProduct: boolean;
  travelLegAccommodations: TravelLegAccommodation[];
  category: string;
  travelClass: string;
  fareFamily: string;
  isThroughfare: boolean;
  saleIndicator: boolean;
  isMixedClass: boolean;
  lowestAvailable?: number;
}

export interface Fare {
  dollarsAmount: DollarsAmount;
  pricingUnit: string;
}

export interface DollarsAmount {
  accommodation: string;
  rail: string;
  total: string;
}

export interface TravelLegAccommodation {
  additionalProducts: any[];
  passengers: Passenger[];
  reservableProduct: ReservableProduct;
  travelLegFare: Fare;
  travelLegId: string;
  isUnaccompaniedChild: boolean;
}

export interface Passenger {
  passengerFare: Fare;
  id: string;
  initialType: string;
  isDiscounted: boolean;
  isModified: boolean;
  type: string;
  ageGroup: string;
}

export interface ReservableProduct {
  availableInventory: number;
  code: string;
  count: number;
  lowAvailabilityThreshold: number;
}
