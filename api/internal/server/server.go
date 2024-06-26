package server

import (
	"glamtrak_api/internal/config"
	"glamtrak_api/internal/services"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Server struct {
	Mux          http.ServeMux
	Redis        *redis.Client
	Config       *config.Config
	HttpUpgrader *websocket.Upgrader
	Lambda       *services.LambdaService
	routes       map[string]http.Handler
}

func NewServer(address string) *Server {
	cfg := config.LoadConfig()

	if address != "" {
		cfg.ServerAddr = address
	}

	log.Println(cfg.ServerAddr)

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       0,
	})

	lambda := &services.LambdaService{
		Config: *cfg,
		Cache:  rdb,
	}

	s := &Server{
		Mux:    *http.NewServeMux(),
		Config: cfg,
		Redis:  rdb,
		Lambda: lambda,
		HttpUpgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true }, // TODO check origin
		},
		routes: make(map[string]http.Handler),
	}

	s.registerRoutes()

	return s
}

func (s *Server) Handle(route string, handler http.Handler) {
	s.routes[route] = handler
}
