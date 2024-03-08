package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	ServerAddr            string
	RedisAddr             string
	RequestThrottleLimit  int64
	AwsRegion             string
	AwsLambdaFunctionName string
}

func LoadConfig() *Config {
	requestLimit, err := strconv.ParseInt(os.Getenv("REQUEST_THROTTLE_LIMIT"), 10, 64)
	if err != nil {
		log.Fatalln("Malformed request limit. Ensure it's set and a number.")
	}

	return &Config{
		AwsLambdaFunctionName: os.Getenv("AWS_LAMBDA_FUNCTION_NAME"),
		AwsRegion:             os.Getenv("AWS_REGION"),
		ServerAddr:            os.Getenv("SERVER_ADDRESS"),
		RedisAddr:             os.Getenv("REDIS_ADDRESS"),
		RequestThrottleLimit:  requestLimit,
	}
}
