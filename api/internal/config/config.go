package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	ServerAddr           string
	RedisAddr            string
	ApiGatewayEndpoint   string
	RequestThrottleLimit int64
}

func LoadConfig() *Config {
	requestLimit, err := strconv.ParseInt(os.Getenv("REQUEST_THROTTLE_LIMIT"), 10, 64)
	if err != nil {
		log.Fatalln("Malformed request limit. Ensure it's set and a number.")
	}

	return &Config{
		ServerAddr:           os.Getenv("SERVER_ADDRESS"),
		RedisAddr:            os.Getenv("REDIS_ADDRESS"),
		ApiGatewayEndpoint:   os.Getenv("API_GATEWAY_ENDPOINT"),
		RequestThrottleLimit: requestLimit,
	}
}
