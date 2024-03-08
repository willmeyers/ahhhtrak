package services_test

import (
	"bytes"
	"encoding/json"
	"glamtrak_api/internal/services"
	"io"
	"net/http"
	"sync"
	"testing"
)

type MockHTTPClient struct {
	DoFunc func(req *http.Request) (*http.Response, error)
}

func (m *MockHTTPClient) Do(req *http.Request) (*http.Response, error) {
	return m.DoFunc(req)
}

func TestInvokeFunction(t *testing.T) {
	var wg sync.WaitGroup
	wg.Add(1)

	mockClient := &MockHTTPClient{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			mockResponse := services.LambdaResponse{
				StatusCode: 200,
				Body:       "{}",
			}
			responseBody, _ := json.Marshal(mockResponse)
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBuffer(responseBody)),
			}, nil
		},
	}

	service := services.APIGatewayLambdaService{
		Endpoint:   "https://api.example.com",
		HttpClient: mockClient,
	}

	event := services.LambdaEvent{
		OriginCode:      "NYP",
		DestinationCode: "WAS",
		Days:            "2024-11-21 2024-11-21 2024-11-21 2024-11-21",
	}

	go func() {
		service.InvokeFunction(event)
		for response := range service.Responses {
			t.Log("got", response.StatusCode)
			if response.StatusCode != 200 {
				t.Errorf("got %d want %d in response.StatusCode", response.StatusCode, 200)
			}
		}
		wg.Done()
	}()

	wg.Wait()
}
