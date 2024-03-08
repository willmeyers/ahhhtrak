package services

type LambdaEvent struct {
	OriginCode      string `json:"originCode"`
	DestinationCode string `json:"destinationCode"`
	DateString      string `json:"dateString"`
}

type LambdaResponse struct {
	StatusCode int    `json:"statusCode"`
	Body       string `json:"body"`
}

type Body struct {
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
	Event     LambdaEvent
	Response  Response `json:"response"`
	Reason    string   `json:"reason"`
}

type Response struct {
	Trip        []Trip `json:"trip"`
	ReverseTrip []Trip `json:"reverseTrip"`
}

type Trip struct {
	OriginCode               string                    `json:"originCode"`
	OriginName               string                    `json:"originName"`
	DestinationCode          string                    `json:"destinationCode"`
	DestinationName          string                    `json:"destinationName"`
	DepartureDateTime        string                    `json:"departureDateTime"`
	ArrivalDateTime          string                    `json:"arrivalDateTime"`
	Legs                     []Leg                     `json:"legs"`
	ReservableAccommodations []ReservableAccommodation `json:"reservableAccommodations"`
}

type Leg struct {
	Destination       Location      `json:"destination"`
	Origin            Location      `json:"origin"`
	TravelService     TravelService `json:"travelService"`
	ElapsedTime       string        `json:"elapsedTime"`
	ID                string        `json:"id"`
	IsBorderCross     bool          `json:"isBorderCross"`
	IsCancelled       bool          `json:"isCancelled"`
	IsRestricted      bool          `json:"isRestricted"`
	SalesOverrideFlag bool          `json:"salesOverrideFlag"`
	NumberOfStops     int           `json:"numberOfStops"`
	IsSelfTransfer    bool          `json:"isSelfTransfer"`
	ElapsedSeconds    int           `json:"elapsedSeconds"`
}

type Location struct {
	Schedule Schedule `json:"schedule"`
	Code     string   `json:"code"`
	Name     string   `json:"name"`
}

type Schedule struct {
	ArrivalDateTime   string `json:"arrivalDateTime,omitempty"`
	DepartureDateTime string `json:"departureDateTime,omitempty"`
}

type TravelService struct {
	Amenities []Amenity `json:"amenities"`
	Carrier   string    `json:"carrier"`
	Name      string    `json:"name"`
	Number    string    `json:"number"`
	Type      string    `json:"type"`
	IsAcela   bool      `json:"isAcela"`
}

type Amenity struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type ReservableAccommodation struct {
	AccommodationFare       Fare                     `json:"accommodationFare"`
	IsAdditionalProduct     bool                     `json:"isAdditionalProduct"`
	TravelLegAccommodations []TravelLegAccommodation `json:"travelLegAccommodations"`
	Category                string                   `json:"category"`
	TravelClass             string                   `json:"travelClass"`
	FareFamily              string                   `json:"fareFamily"`
	IsThroughfare           bool                     `json:"isThroughfare"`
	SaleIndicator           bool                     `json:"saleIndicator"`
	IsMixedClass            bool                     `json:"isMixedClass"`
	LowestAvailable         int                      `json:"lowestAvailable,omitempty"`
}

type Fare struct {
	DollarsAmount DollarsAmount `json:"dollarsAmount"`
	PricingUnit   string        `json:"pricingUnit"`
}

type DollarsAmount struct {
	Accommodation string `json:"accommodation"`
	Rail          string `json:"rail"`
	Total         string `json:"total"`
}

type TravelLegAccommodation struct {
	AdditionalProducts   []interface{}     `json:"additionalProducts"`
	Passengers           []Passenger       `json:"passengers"`
	ReservableProduct    ReservableProduct `json:"reservableProduct"`
	TravelLegFare        Fare              `json:"travelLegFare"`
	TravelLegId          string            `json:"travelLegId"`
	IsUnaccompaniedChild bool              `json:"isUnaccompaniedChild"`
}

type Passenger struct {
	PassengerFare Fare   `json:"passengerFare"`
	ID            string `json:"id"`
	InitialType   string `json:"initialType"`
	IsDiscounted  bool   `json:"isDiscounted"`
	IsModified    bool   `json:"isModified"`
	Type          string `json:"type"`
	AgeGroup      string `json:"ageGroup"`
}

type ReservableProduct struct {
	AvailableInventory       int    `json:"availableInventory"`
	Code                     string `json:"code"`
	Count                    int    `json:"count"`
	LowAvailabilityThreshold int    `json:"lowAvailabilityThreshold"`
}
