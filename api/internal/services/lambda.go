package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/redis/go-redis/v9"

	"glamtrak_api/internal/config"
)

type LambdaService struct {
	Config config.Config
	Cache  *redis.Client
}

func (s *LambdaService) InvokeFunction(event LambdaEvent, responses chan LambdaResponse) {
	var response LambdaResponse

	cachedKey := fmt.Sprintf("schedule_cache:%s_%s_%s", event.OriginCode, event.DestinationCode, event.DateString)
	cachedReverseKey := fmt.Sprintf("schedule_cache:%s_%s_%s", event.DestinationCode, event.OriginCode, event.DateString)
	cachedResponse, err := s.Cache.Get(context.Background(), cachedKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(cachedResponse), &response); err == nil {
			responses <- response
			return
		} else {
			log.Println("Error unmarshaling cached response:", err)
		}
	}

	cachedReverseResponse, err := s.Cache.Get(context.Background(), cachedReverseKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(cachedReverseResponse), &response); err == nil {
			responses <- response
			return
		} else {
			log.Println("Error unmarshaling cached response:", err)
		}
	}

	payload, err := json.Marshal(event)
	if err != nil {
		fmt.Println("Error marshaling event:", err)
		return
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(s.Config.AwsRegion)},
	)
	if err != nil {
		fmt.Println("Error creating AWS session:", err)
		return
	}

	svc := lambda.New(sess)

	invokeInput := &lambda.InvokeInput{
		FunctionName:   aws.String(s.Config.AwsLambdaFunctionName),
		InvocationType: aws.String("RequestResponse"),
		Payload:        payload,
	}

	result, err := svc.Invoke(invokeInput)
	if err != nil {
		fmt.Println("Error invoking Lambda function:", err)
		return
	}

	if err := json.Unmarshal(result.Payload, &response); err != nil {
		fmt.Println("Error unmarshaling Lambda response:", err)
		return
	}

	responseBytes, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Error marshaling response for caching:", err)
	} else {
		if err := s.Cache.Set(context.Background(), cachedKey, responseBytes, 24*time.Hour).Err(); err != nil {
			fmt.Println("Error caching the response:", err)
		}
	}

	responses <- response
}
