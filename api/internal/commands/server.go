package commands

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"glamtrak_api/internal/server"
)

type RunServerCommand struct {
	address string
}

func (cmd *RunServerCommand) Run(args []string) {
	server := server.NewServer(cmd.address)
	httpServer := &http.Server{
		Addr:    cmd.address,
		Handler: &server.Mux,
	}

	go func() {
		log.Println("Running server at", server.Config.ServerAddr)
		if err := httpServer.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("Error %v\n", err)
		}
	}()

	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, syscall.SIGINT, syscall.SIGTERM)
	<-stopChan
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatalf("Error shutdown %v\n", err)
	}
}
