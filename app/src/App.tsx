import { useEffect, useState } from "react";
import "./App.css";
import { executeSearch, searchResults, filterSearchResults } from "./api";
import { SearchBar } from "./components/SearchBar";
import { ResultTable } from "./components/ResultTable";

import { LambdaResponse, Body, Trip, ResultFilters } from "./types";

function App() {
  const [event, setEvent] = useState<{
    originCode: string;
    destinationCode: string;
    days: string;
  } | null>(null);
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
    setResults([]);
    setEvent(values);
    const searchExecution = await executeSearch({ event: values });
    const ws = await searchResults({ taskID: searchExecution.taskID });

    ws.addEventListener("open", () => setLoading(true));

    ws.addEventListener("message", (event) => {
      const response: LambdaResponse = JSON.parse(event.data);
      const responseBody: Body = JSON.parse(response.body as unknown as string);
      for (const result of responseBody.response[direction]) {
        setResults((prev) => [...prev, result]);
      }
    });

    ws.addEventListener("close", () => setLoading(false));
  };

  useEffect(() => {
    const newResults = filterSearchResults({
      results: results,
      filters: filters,
    });
    setFilteredResults(newResults);
  }, [results]);

  useEffect(() => {
    setFilteredResults(
      filterSearchResults({ results: results, filters: filters }),
    );
  }, [filters]);

  useEffect(() => {
    const fares = filteredResults.map((r) =>
      parseInt(
        r.reservableAccommodations[0].accommodationFare.dollarsAmount.total,
      ),
    );

    if (filteredResults.length > 0) {
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
    }
  }, [filteredResults]);

  return (
    <main className="flex h-screen w-screen flex-col">
      <div className="flex place-self-center pb-8 pt-32">
        <SearchBar onSubmit={handleSubmit} />
      </div>
      {loading ? (
        <div className="flex justify-center font-mono">Loading...</div>
      ) : null}
      {results.length > 0 ? (
        <div className="flex flex-col justify-center font-mono">
          <div>
            <div className="flex gap-16 border p-8 shadow-sm">
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
          <div className="flex">
            <h3>Filter Schedules</h3>
            <div>
              <label>Date:</label>
              {event &&
                event.days.split(" ").map((d) => (
                  <div>
                    <label htmlFor={d}>{d}</label>
                    <input
                      id={d}
                      key={`${d}-filter-choice`}
                      type="radio"
                      name="filterDate"
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          date: event.target.checked ? d : undefined,
                        }))
                      }
                    />
                  </div>
                ))}
            </div>
            <div>
              <h3>Departure Time:</h3>
              <div>
                <label htmlFor="12a-6a">12a-6a</label>
                <input
                  id="12a-6a"
                  type="radio"
                  name="filterDepartureTime"
                  checked={filters.departureTime === "12a-6a"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      departureTime: event.target.checked
                        ? "12a-6a"
                        : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="6a-12p">6a-12p</label>
                <input
                  id="6a-12p"
                  type="radio"
                  name="filterDepartureTime"
                  checked={filters.departureTime === "6a-12p"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      departureTime: event.target.checked
                        ? "6a-12p"
                        : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="12p-6p">12p-6p</label>
                <input
                  id="12p-6p"
                  type="radio"
                  name="filterDepartureTime"
                  checked={filters.departureTime === "12p-6p"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      departureTime: event.target.checked
                        ? "12p-6p"
                        : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="6p-12a">6p-12a</label>
                <input
                  id="6p-12a"
                  type="radio"
                  name="filterDepartureTime"
                  checked={filters.departureTime === "6p-12a"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      departureTime: event.target.checked
                        ? "6p-12a"
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <h3>Sort By:</h3>
              <div>
                <label htmlFor="fareChoice">Fare</label>
                <input
                  id="fareChoice"
                  type="radio"
                  name="filterSoryBy"
                  checked={filters.sortByAsc === "fare"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortByAsc: event.target.checked ? "fare" : undefined,
                    }))
                  }
                />
                <label htmlFor="departureDateChoice">Departure Date</label>
                <input
                  id="departureDateChoice"
                  type="radio"
                  name="filterSoryBy"
                  checked={filters.sortByAsc === "departureDate"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortByAsc: event.target.checked
                        ? "departureDate"
                        : undefined,
                    }))
                  }
                />
                <label htmlFor="arrivialDateChoice">Arrival Date</label>
                <input
                  id="arrivialDateChoice"
                  type="radio"
                  name="filterSoryBy"
                  checked={filters.sortByAsc === "arrivalDate"}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortByAsc: event.target.checked
                        ? "arrivalDate"
                        : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setFilters({})}
                  className="bg-blue-500 p-1 text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center p-8">
            <ResultTable results={filteredResults} />
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
