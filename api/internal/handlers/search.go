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
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type obtainSearchTaskHandlerResponse struct {
	Status            string               `json:"status"`
	TaskID            string               `json:"taskID"`
	RequestParameters services.LambdaEvent `json:"requestParameters"`
}

func (handler *ServerHandler) ObtainSearchTaskHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody services.LambdaEvent
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

	log.Println("generated:", taskID)
	log.Printf("key: task_request:%v\n", taskID)

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

	var taskRequestEvent services.LambdaEvent
	requestTaskKey := fmt.Sprintf("task_request:%v", taskID)
	requestTaskBody, err := handler.Redis.Get(context.Background(), requestTaskKey).Result()
	if err == redis.Nil {
		log.Println("Empty request for taskID", taskID, requestTaskKey)
		http.Error(w, err.Error(), http.StatusBadRequest)
	} else if err != nil {
		log.Println("error", taskID, requestTaskKey)
		http.Error(w, err.Error(), http.StatusBadRequest)
	} else {
		log.Println("success...", taskID, requestTaskKey)
	}

	if err := json.Unmarshal([]byte(requestTaskBody), &taskRequestEvent); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		handler.Api.InvokeFunction(taskRequestEvent)
		wg.Done()
	}()

	go func() {
		for response := range handler.Api.Responses {
			handler.Mutex.Lock()
			if err := wsConn.WriteJSON(response); err != nil {
				wsConn.WriteMessage(0, []byte(err.Error()))
			}
			handler.Mutex.Unlock()
		}
	}()

}
