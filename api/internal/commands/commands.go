package commands

import (
	"log"
)

type Command interface {
	Run(args []string) error
}

func Run(args []string) {
	switch args[0] {
	case "runserver":
		address := ""
		if len(args) >= 2 {
			address = args[1]
		}

		cmd := &RunServerCommand{
			address: address,
		}
		cmd.Run(args)
	default:
		log.Fatalln("Missing command")
	}
}
