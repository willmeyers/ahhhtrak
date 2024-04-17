import { ResultFilters, Trip } from "./types";

const API_BASE_DOMAIN = "api.ahhhtrak.com";

const API_BASE_URL = "https://api.ahhhtrak.com";

export const healthCheck = async (): Promise<{
  status: number;
  message: string;
}> => {
  let status = 500;
  let message = "Internal Server Error.";

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });
  } catch (e) {
    return { status, message };
  }

  if (response.status === 503) {
    status = response.status;
    message =
      "Ahhhtrak cannot connect to its external proxy service and deliver you results.";
  }

  if (response.status === 200) {
    status = 200;
    message = "";
  }

  return { status, message };
};

export const executeSearch = async ({
  event,
}: {
  event: {
    originCode: string;
    destinationCode: string;
    days: string;
  };
}) => {
  const response = await fetch(`${API_BASE_URL}/search:execute`, {
    method: "POST",
    body: JSON.stringify(event),
  });

  const paylaod = await response.json();

  return paylaod;
};

export const searchResults = async ({ taskID }: { taskID: number }) => {
  const ws = new WebSocket(
    `wss://${API_BASE_DOMAIN}/search:results?taskID=${taskID}`,
  );

  return ws;
};

export const filterSearchResults = ({
  results,
  filters,
}: {
  results: Trip[];
  filters: ResultFilters;
}) => {
  let filteredResults: Trip[] = results;

  if (filters.date) {
    filteredResults = results.filter((trip) =>
      trip.departureDateTime.startsWith(filters.date!),
    );
  }

  if (filters.departureTime) {
    const timeRanges = {
      "12a-6a": ["00:00", "06:00"],
      "6a-12p": ["06:00", "12:00"],
      "12p-6p": ["12:00", "18:00"],
      "6p-12a": ["18:00", "23:59"],
    };
    const [startTime, endTime] = timeRanges[filters.departureTime];
    filteredResults = filteredResults.filter((trip) => {
      const departureTime = trip.departureDateTime.split("T")[1];
      return departureTime >= startTime && departureTime < endTime;
    });
  }

  if (filters.sortByAsc) {
    switch (filters.sortByAsc) {
      case "fare":
        filteredResults.sort((a, b) => {
          const fareA = parseFloat(
            a.reservableAccommodations[0].accommodationFare.dollarsAmount.total,
          );
          const fareB = parseFloat(
            b.reservableAccommodations[0].accommodationFare.dollarsAmount.total,
          );
          return fareA - fareB;
        });
        break;
      case "departureDate":
        filteredResults.sort(
          (a, b) =>
            new Date(a.departureDateTime).getTime() -
            new Date(b.departureDateTime).getTime(),
        );
        break;
      case "arrivalDate":
        filteredResults.sort(
          (a, b) =>
            new Date(a.arrivalDateTime).getTime() -
            new Date(b.arrivalDateTime).getTime(),
        );
        break;
    }
  }

  console.log(filteredResults);

  return filteredResults;
};
