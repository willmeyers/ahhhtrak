import { useEffect, useState } from "react";
import "./App.css";
import {
  healthCheck,
  executeSearch,
  searchResults,
  filterSearchResults,
} from "./api";
import { SearchBar } from "./components/SearchBar";
import { ResultTable } from "./components/ResultTable";

import { LambdaResponse, Body, Trip, ResultFilters } from "./types";

function App() {
  const [event, setEvent] = useState<{
    originCode: string;
    destinationCode: string;
    days: string;
  } | null>(null);
  const [apiHealthCheck, setApiHealthCheck] = useState<{
    status: number;
    message: string;
  } | null>(null);

  const [events, setEvents] = useState<LambdaResponse[]>([]);
  const [results, setResults] = useState<Trip[]>([]);

  const [filters, setFilters] = useState<ResultFilters>({});
  const [filteredResults, setFilteredResults] = useState<Trip[]>([]);
  const [direction, setDirection] = useState<"trip" | "reverseTrip">("trip");
  const [lowestFare, setLowestFare] = useState<string>("-");
  const [averageFare, setAverageFare] = useState<string>("-");
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async (values: {
    originCode: string;
    destinationCode: string;
    days: string;
  }) => {
    setEvents([]);
    setResults([]);
    setFilters({});
    setEvent(values);
    const searchExecution = await executeSearch({ event: values });
    const ws = await searchResults({ taskID: searchExecution.taskID });

    ws.addEventListener("open", () => setLoading(true));

    ws.addEventListener("message", (event) => {
      const response: LambdaResponse = JSON.parse(event.data);
      // @ts-expect-error  response.body is a string when returned from server
      if (response.body.length === 0) {
        setEvents((prev) => [...prev, response]);
        return;
      } else {
        const responseBody: Body = JSON.parse(
          response.body as unknown as string,
        );
        const initialDicrection =
          responseBody.event.originCode === values.originCode
            ? "trip"
            : "reverseTrip";
        setDirection(initialDicrection);
        for (const result of responseBody.response[initialDicrection]) {
          setResults((prev) => [...prev, result]);
        }
        setEvents((prev) => [...prev, response]);
      }
    });

    ws.addEventListener("close", () => setLoading(false));
  };

  const applyFilters = ({ filters }: { filters: ResultFilters }) => {
    setFilteredResults([]);

    const newResults = filterSearchResults({
      results: results,
      filters: filters,
    });

    const fares = newResults.map((r) =>
      parseInt(
        r.reservableAccommodations[0].accommodationFare.dollarsAmount.total,
      ),
    );

    if (newResults.length > 0) {
      let fareSum = 0;
      let minFare = null;
      for (let i = 0; i < fares.length; i++) {
        fareSum += fares[i];
        if (!minFare) {
          minFare = fares[i];
        }

        if (fares[i] < minFare) minFare = fares[i];
      }

      setLowestFare(String(minFare));
      setAverageFare(String(Math.floor(fareSum / fares.length)));

      setFilteredResults(newResults);
    }
  };

  useEffect(() => {
    if (!apiHealthCheck) {
      healthCheck().then((result) => {
        setApiHealthCheck(result);
      });
    }
  }, []);

  useEffect(() => {
    let newResults = [];

    for (const eventResponse of events) {
      if (eventResponse.body.length === 0) {
        continue;
      }
      const responseBody: Body = JSON.parse(
        eventResponse.body as unknown as string,
      );
      for (const result of responseBody.response[direction]) {
        newResults.push(result);
      }
    }

    setResults(newResults);
  }, [direction]);

  useEffect(() => {
    const newResults = filterSearchResults({
      results: results,
      filters: filters,
    });

    const fares = newResults.map((r) =>
      parseInt(
        r.reservableAccommodations[0].accommodationFare.dollarsAmount.total,
      ),
    );

    if (newResults.length > 0) {
      let fareSum = 0;
      let minFare = null;
      for (let i = 0; i < fares.length; i++) {
        fareSum += fares[i];
        if (!minFare) {
          minFare = fares[i];
        }

        if (fares[i] < minFare) minFare = fares[i];
      }

      setLowestFare(String(minFare));
      setAverageFare(String(Math.floor(fareSum / fares.length)));

      setFilteredResults(newResults);
    }
  }, [results]);

  return (
    <main className="flex h-screen w-screen flex-col">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="pt-16 text-6xl font-bold">Ahhhtrak</h1>
        <p className="text-xl">Search and find the cheapest Amtrak fares.</p>
      </div>
      {apiHealthCheck && apiHealthCheck.status !== 200 ? (
        <div className="flex flex-col place-self-center pb-8 pt-32 text-center text-red-500">
          <h2>Ahhhtrak is currently experiencing degraded service :/</h2>
          <p>Reason: {apiHealthCheck.message}</p>
          <p>Please try again later.</p>
        </div>
      ) : null}
      <div className="flex place-self-center pb-8 pt-32">
        <SearchBar
          onSubmit={handleSubmit}
          setDirection={setDirection}
          isLoading={loading}
        />
      </div>
      {loading ? (
        <div className="flex flex-col justify-center gap-1 p-4 text-center font-mono">
          <p>Loading... Results are shown as soon as they are available.</p>
          <p>Please be patient :) This can take up to a minute.</p>
        </div>
      ) : null}
      {results.length === 0 && events.length > 0 && !loading ? (
        <p className="p-8 text-center text-red-500">
          No results for this trip could be found :/ This could be an error.
          Please check Amtrak itself for possible results.
        </p>
      ) : null}
      {results.length > 0 ? (
        <div className="flex flex-col justify-center font-mono">
          <div className="flex flex-col justify-center border p-8 shadow-sm">
            <div className="flex justify-center gap-16">
              <span>
                <span className="font-bold">{results.length}</span> total
                schedules
              </span>
              <span>
                Lowest Fare:{" "}
                <span className="font-bold text-green-500">
                  ${lowestFare ? lowestFare : "-"}
                </span>
              </span>
              <span>
                Averge Fare:{" "}
                <span className="font-bold">
                  ${averageFare ? averageFare : "-"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex w-full justify-center gap-6 p-4">
            <div className="flex flex-col gap-2 border p-1">
              <h2 className="text-center font-bold">Filters</h2>
              <div className="flex h-fit flex-col rounded border">
                <h3 className="bg-blue-500 p-1 text-white">Date</h3>
                {event &&
                  event.days.split(" ").map((d) => (
                    <div
                      className="flex items-center gap-2 border-t p-1"
                      key={`event-${d}`}
                    >
                      <input
                        id={d}
                        key={`${d}-filter-choice`}
                        type="radio"
                        name="filterDate"
                        checked={filters.date === d}
                        onChange={(event) => {
                          const f = {
                            ...filters,
                            date: event.target.checked ? d : undefined,
                          };
                          applyFilters({ filters: f });
                          setFilters(f);
                        }}
                      />
                      <label htmlFor={d}>{d}</label>
                    </div>
                  ))}
              </div>
              <div className="flex h-fit flex-col rounded border">
                <h3 className="bg-blue-500 p-1 text-white">Departure Time</h3>
                <div className="flex items-center gap-2 border-t p-1">
                  <input
                    id="12a-6a"
                    type="radio"
                    name="filterDepartureTime"
                    checked={filters.departureTime === "12a-6a"}
                    onChange={(event) => {
                      const f: ResultFilters = {
                        ...filters,
                        departureTime: event.target.checked
                          ? "12a-6a"
                          : undefined,
                      };
                      applyFilters({ filters: f });
                      setFilters(f);
                    }}
                  />
                  <label htmlFor="12a-6a">12a-6a</label>
                </div>
                <div className="flex items-center gap-2 border-t p-1">
                  <input
                    id="6a-12p"
                    type="radio"
                    name="filterDepartureTime"
                    checked={filters.departureTime === "6a-12p"}
                    onChange={(event) => {
                      const f: ResultFilters = {
                        ...filters,
                        departureTime: event.target.checked
                          ? "6a-12p"
                          : undefined,
                      };
                      applyFilters({ filters: f });
                      setFilters(f);
                    }}
                  />
                  <label htmlFor="6a-12p">6a-12p</label>
                </div>
                <div className="flex items-center gap-2 border-t p-1">
                  <input
                    id="12p-6p"
                    type="radio"
                    name="filterDepartureTime"
                    checked={filters.departureTime === "12p-6p"}
                    onChange={(event) => {
                      const f: ResultFilters = {
                        ...filters,
                        departureTime: event.target.checked
                          ? "12p-6p"
                          : undefined,
                      };
                      applyFilters({ filters: f });
                      setFilters(f);
                    }}
                  />
                  <label htmlFor="12p-6p">12p-6p</label>
                </div>
                <div className="flex items-center gap-2 border-t p-1">
                  <input
                    id="6p-12a"
                    type="radio"
                    name="filterDepartureTime"
                    checked={filters.departureTime === "6p-12a"}
                    onChange={(event) => {
                      const f: ResultFilters = {
                        ...filters,
                        departureTime: event.target.checked
                          ? "6p-12a"
                          : undefined,
                      };
                      applyFilters({ filters: f });
                      setFilters(f);
                    }}
                  />
                  <label htmlFor="6p-12a">6p-12a</label>
                </div>
              </div>
              <div className="flex h-fit flex-col rounded border">
                <h3 className="bg-blue-500 p-1 text-white">Sort By:</h3>
                <div>
                  <div className="flex items-center gap-2 border-t p-1">
                    <input
                      id="fareChoice"
                      type="radio"
                      name="filterSoryBy"
                      checked={filters.sortByAsc === "fare"}
                      onChange={(event) => {
                        const f: ResultFilters = {
                          ...filters,
                          sortByAsc: event.target.checked ? "fare" : undefined,
                        };
                        applyFilters({ filters: f });
                        setFilters(f);
                      }}
                    />
                    <label htmlFor="fareChoice">Fare</label>
                  </div>
                  <div className="flex items-center gap-2 border-t p-1">
                    <input
                      id="departureDateChoice"
                      type="radio"
                      name="filterSoryBy"
                      checked={filters.sortByAsc === "departureDate"}
                      onChange={(event) => {
                        const f: ResultFilters = {
                          ...filters,
                          sortByAsc: event.target.checked
                            ? "departureDate"
                            : undefined,
                        };
                        applyFilters({ filters: f });
                        setFilters(f);
                      }}
                    />
                    <label htmlFor="departureDateChoice">Departure Date</label>
                  </div>
                  <div className="flex items-center gap-2 border-t p-1">
                    <input
                      id="arrivialDateChoice"
                      type="radio"
                      name="filterSoryBy"
                      checked={filters.sortByAsc === "arrivalDate"}
                      onChange={(event) => {
                        const f: ResultFilters = {
                          ...filters,
                          sortByAsc: event.target.checked
                            ? "arrivalDate"
                            : undefined,
                        };
                        applyFilters({ filters: f });
                        setFilters(f);
                      }}
                    />
                    <label htmlFor="arrivialDateChoice">Arrival Date</label>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  applyFilters({ filters: {} });
                  setFilters({});
                }}
                className="rounded bg-blue-500 p-1 text-white"
              >
                Reset Filters
              </button>
            </div>
            <div className="p-0">
              <ResultTable results={filteredResults} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
