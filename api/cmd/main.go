package main

import (
	"fmt"
	"glamtrak_api/internal/commands"
	"os"
)

func main() {
	if len(os.Args) <= 1 {
		fmt.Println("Missing or invalid command. Current options are: `runserver`.")
		os.Exit(2)
	}
	commands.Run(os.Args[1:])
}
