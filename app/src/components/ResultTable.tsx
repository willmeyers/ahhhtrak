import type { Trip } from "../types";
import arrow from "../assets/arrow.svg";

export const ResultTable = ({ results }: { results: Trip[] }) => {
  const formatTimeFromDate = (date: string) => {
    let d = new Date(date);
    return d
      .toLocaleTimeString()
      .replace("AM", "am")
      .replace("PM", "pm")
      .replace(" ", "")
      .replace(":00", "");
  };

  return (
    <table className="w-full max-w-max border border-blue-500 font-mono">
      <thead className="bg-blue-500 p-2 text-white">
        <tr className="py-1 text-left">
          <th className="p-3">Date</th>
          <th className="p-3">Departs At</th>
          <th className="p-3">Arrives At</th>
          <th className="p-3">Journey</th>
          <th className="p-3">Fare</th>
        </tr>
      </thead>
      <tbody className="p-2">
        {results.length === 0 ? (
          <p className="p-4 text-red-500">No results.</p>
        ) : null}
        {results.map((r, idx) => (
          <tr
            key={`result-${r.departureDateTime}-${idx}`}
            className="py-1 hover:bg-blue-50"
          >
            <td className="p-3">
              {new Date(r.departureDateTime).toDateString()}
            </td>
            <td className="p-3">{formatTimeFromDate(r.departureDateTime)}</td>
            <td className="p-3">{formatTimeFromDate(r.arrivalDateTime)}</td>
            <td className="p-3">
              <ul className="m-0 flex flex-col gap-1 p-0">
                {r.legs.map((l) => (
                  <li
                    key={`leg-${r.departureDateTime}-${l.origin.code}-${l.destination.code}`}
                    className="flex items-center gap-1 text-xs"
                  >
                    <img src={arrow} width="14" />
                    <abbr title={l.origin.name}>{l.origin.code}</abbr>
                    <span className="font-semibold">
                      [{l.travelService.name}]
                    </span>
                    <abbr title={l.destination.name}>{l.destination.code}</abbr>
                  </li>
                ))}
              </ul>
            </td>
            <td className="p-3">
              {
                r.reservableAccommodations[0].accommodationFare.dollarsAmount
                  .total
              }{" "}
              ({r.reservableAccommodations[0].travelClass})
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
