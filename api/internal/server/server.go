package server

import (
	"glamtrak_api/internal/config"
	"glamtrak_api/internal/services"
	"net/http"
	"log"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Server struct {
	Mux          http.ServeMux
	Redis        *redis.Client
	Config       *config.Config
	HttpUpgrader *websocket.Upgrader
	Api          *services.APIGatewayLambdaService
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
		Password: "",
		DB:       0,
	})

	api := &services.APIGatewayLambdaService{
		Endpoint:   cfg.ApiGatewayEndpoint,
		HttpClient: &http.Client{},
	}

	s := &Server{
		Mux:    *http.NewServeMux(),
		Config: cfg,
		Redis:  rdb,
		Api:    api,
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
