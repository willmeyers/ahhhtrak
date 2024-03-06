package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
)

// This is mainly defined for testing purposes, as it's simple to mock
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

type APIGatewayLambdaService struct {
	Responses  chan LambdaResponse
	Endpoint   string
	HttpClient HTTPClient
}

func (s *APIGatewayLambdaService) InvokeFunction(event LambdaEvent) {
	var formattedDaySlice []string
	requestDaySlice := strings.Fields(event.Days)
	for _, day := range requestDaySlice {
		parts := strings.Split(day, "-")
		if len(parts) == 3 {
			reformattedDate := fmt.Sprintf("%s/%s/%s", parts[2], parts[1], parts[0])
			formattedDaySlice = append(formattedDaySlice, reformattedDate)
		}
	}

	s.Responses = make(chan LambdaResponse, len(formattedDaySlice))
	var wg sync.WaitGroup
	wg.Add(len(formattedDaySlice))

	for _, date := range formattedDaySlice {
		go func(date string) {
			defer wg.Done()

			var response LambdaResponse

			payload := map[string]string{
				"originCode":      event.OriginCode,
				"destinationCode": event.DestinationCode,
				"dateString":      date,
			}
			payloadBytes, err := json.Marshal(payload)
			if err != nil {
				fmt.Println("Error marshaling payload:", err)
				return
			}

			req, err := http.NewRequest("POST", s.Endpoint, bytes.NewBuffer(payloadBytes))
			if err != nil {
				fmt.Println("Error creating request:", err)
				return
			}
			req.Header.Set("Content-Type", "application/json")

			resp, err := s.HttpClient.Do(req)
			if err != nil {
				fmt.Println("Error sending request:", err)
				return
			}
			defer resp.Body.Close()

			if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
				fmt.Println("Error decoding response:", err)
				return
			}

			s.Responses <- response
		}(date)
	}

	wg.Wait()
	close(s.Responses)
}
