package server

import (
	"net/http"
	"sync"

	"glamtrak_api/internal/handlers"
	"glamtrak_api/internal/middlewares"
)

func ApplyMiddleware(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for _, middleware := range middlewares {
		h = middleware(h)
	}
	return h
}

func (s *Server) registerRoutes() {
	var middlewares = []func(http.Handler) http.Handler{
		middlewares.CORSMiddleware(),
		middlewares.RequestThrottleMiddleware(s.Redis, s.Config.RequestThrottleLimit),
	}

	handler := handlers.ServerHandler{
		Redis:        s.Redis,
		HttpUpgrader: s.HttpUpgrader,
		Lambda:       s.Lambda,
		Mutex:        sync.Mutex{},
		ProxyURL:     s.Config.ProxyURL,
	}

	s.Handle("/health", ApplyMiddleware(http.HandlerFunc(handler.HealthCheckHandler), middlewares...))
	s.Handle("/search:execute", ApplyMiddleware(http.HandlerFunc(handler.ObtainSearchTaskHandler), middlewares...))
	s.Handle("/search:results", ApplyMiddleware(http.HandlerFunc(handler.SearchResultWSHandler), middlewares...))

	for route, handler := range s.routes {
		s.Mux.Handle(route, handler)
	}
}
