package handlers

import (
	"glamtrak_api/internal/services"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type ServerHandler struct {
	Redis        *redis.Client
	ProxyURL     string
	HttpUpgrader *websocket.Upgrader
	Lambda       *services.LambdaService
	Mutex        sync.Mutex
}
