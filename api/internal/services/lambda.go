package services

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"

	"glamtrak_api/internal/config"
)

type LambdaService struct {
	Responses chan LambdaResponse
	Config    config.Config
}

func (s *LambdaService) InvokeFunction(event LambdaEvent) {
	log.Println("sent out", event.OriginCode, event.DestinationCode, event.DateString)

	var response LambdaResponse
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

	s.Responses <- response
}
