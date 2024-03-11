package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"glamtrak_api/internal/services"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type requestParamers struct {
	OriginCode      string `json:"originCode"`
	DestinationCode string `json:"destinationCode"`
	Days            string `json:"days"`
}

type obtainSearchTaskHandlerResponse struct {
	Status            string          `json:"status"`
	TaskID            string          `json:"taskID"`
	RequestParameters requestParamers `json:"requestParameters"`
}

func (handler *ServerHandler) ObtainSearchTaskHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody requestParamers
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if requestBody.OriginCode == "" {
		http.Error(w, "Missing originCode", http.StatusBadRequest)
		return
	}

	if requestBody.DestinationCode == "" {
		http.Error(w, "Missing destinationCode", http.StatusBadRequest)
		return
	}

	if requestBody.Days == "" {
		http.Error(w, "Missing days", http.StatusBadRequest)
		return
	}

	taskID := rand.Uint64()

	requestBodyJSON, err := json.Marshal(&requestBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	key := fmt.Sprintf("task_request:%v", taskID)
	handler.Redis.Set(context.Background(), key, requestBodyJSON, 5*time.Minute)

	response := &obtainSearchTaskHandlerResponse{
		Status:            "ok",
		TaskID:            strconv.FormatUint(taskID, 10),
		RequestParameters: requestBody,
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (handler *ServerHandler) SearchResultWSHandler(w http.ResponseWriter, r *http.Request) {
	wsConn, err := handler.HttpUpgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer wsConn.Close()

	taskIDParam := r.URL.Query().Get("taskID")
	if taskIDParam == "" {
		http.Error(w, "TaskID is required", http.StatusBadRequest)
		return
	}
	taskID, err := strconv.ParseUint(taskIDParam, 10, 64)
	if err != nil {
		http.Error(w, "Invalid taskID format", http.StatusBadRequest)
		return
	}

	var taskRequest requestParamers
	requestTaskKey := fmt.Sprintf("task_request:%v", taskID)
	requestTaskBody, err := handler.Redis.Get(context.Background(), requestTaskKey).Result()
	if err == redis.Nil {
		log.Println("Empty request for taskID", taskID, requestTaskKey)
		http.Error(w, err.Error(), http.StatusBadRequest)
	} else if err != nil {
		log.Println("error", taskID, requestTaskKey)
		http.Error(w, err.Error(), http.StatusBadRequest)
	}

	if err := json.Unmarshal([]byte(requestTaskBody), &taskRequest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var formattedDaySlice []string
	requestDaySlice := strings.Fields(taskRequest.Days)
	if len(requestDaySlice) > 7 {
		http.Error(w, "Cannot get results for more than 7 days", http.StatusBadRequest)
		return
	}

	for _, day := range requestDaySlice {
		_, err := time.Parse("2006-01-02", day)
		if err != nil {
			continue
		}
		parts := strings.Split(day, "-")
		if len(parts) == 3 {
			month := parts[1]
			day := parts[2]
			year := parts[0]

			if month[0] == '0' {
				month = month[1:]
			}
			if day[0] == '0' {
				day = day[1:]
			}
			reformattedDate := fmt.Sprintf("%s/%s/%s", month, day, year)
			formattedDaySlice = append(formattedDaySlice, reformattedDate)
		}
	}

	responses := make(chan services.LambdaResponse, len(formattedDaySlice))
	var wg sync.WaitGroup
	for _, date := range formattedDaySlice {
		wg.Add(1)
		go func(date string) {
			defer wg.Done()
			event := services.LambdaEvent{
				OriginCode:      taskRequest.OriginCode,
				DestinationCode: taskRequest.DestinationCode,
				DateString:      date,
			}

			handler.Lambda.InvokeFunction(event, responses)
		}(date)
	}

	go func() {
		wg.Wait()
		close(responses)
	}()

	for response := range responses {
		handler.Mutex.Lock()
		if err := wsConn.WriteJSON(response); err != nil {
			log.Println("Error sending response:", err)
			break
		}
		handler.Mutex.Unlock()
	}
}
