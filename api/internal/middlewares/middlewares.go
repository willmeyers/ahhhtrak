package middlewares

import (
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

type Middleware func(http.Handler) http.Handler

func CORSMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET POST OPTIONS")
			w.Header().Set("Access-Control-Max-Age", "86400")

			// Handle preflight request
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func RequestThrottleMiddleware(rdb *redis.Client, limit int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			key := fmt.Sprintf("rate_limit:%s", ip)

			ctx := r.Context()
			count, err := rdb.Get(ctx, key).Int64()
			if err != nil && err != redis.Nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			if count == 0 {
				if err := rdb.Set(ctx, key, 1, 10*time.Minute).Err(); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			} else if count >= limit {
				http.Error(w, "Too many requests", http.StatusTooManyRequests)
				return
			} else {
				if err := rdb.Incr(ctx, key).Err(); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}
