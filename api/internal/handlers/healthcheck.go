package handlers

import (
	"log"
	"net/http"
	"net/url"
)

func (handler *ServerHandler) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	proxyURL, err := url.Parse(handler.Config.ProxyURL)
	if err != nil {
		log.Println("Error parsing proxy URL:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	httpClient := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
	}

	response, err := httpClient.Get("http://httpbin.org/get")
	if err != nil {
		log.Println("Error making request through proxy:", err)
		http.Error(w, "Proxy Unreachable", http.StatusServiceUnavailable)
		return
	}
	defer response.Body.Close()

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
