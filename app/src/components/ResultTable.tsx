import type { Trip } from "../types";

export const ResultTable = ({ results }: { results: Trip[] }) => {
  const formatTimeFromDate = (date: string) => {
    let d = new Date(date);
    let h = d.getHours();
    h = h > 12 ? h - 12 : h;
    let m = d.getMinutes();
    // return `${h}:${m < 10 ? "0" + m : m}${} [${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}]`;
    return d
      .toLocaleTimeString()
      .replace("AM", "am")
      .replace("PM", "pm")
      .replace(" ", "")
      .replace(":00", "");
  };

  return (
    <table className="w-full max-w-max font-mono">
      <thead className="bg-blue-500 text-white">
        <tr className="py-1 text-left">
          <th className="p-3">Date</th>
          <th className="p-3">Departs At</th>
          <th className="p-3">Arrives At</th>
          <th className="p-3">Journey</th>
          <th className="p-3">Fare</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => (
          <tr
            key={`result-${r.departureDateTime}`}
            className="py-1 hover:bg-blue-50"
          >
            <td className="p-3">
              {new Date(r.departureDateTime).toDateString()}
            </td>
            <td className="p-3">{formatTimeFromDate(r.departureDateTime)}</td>
            <td className="p-3">{formatTimeFromDate(r.arrivalDateTime)}</td>
            <td className="p-3">
              {r.legs.map((l) => (
                <span>
                  {l.origin.name} via{" "}
                  <span className="font-bold">{l.travelService.name}</span> to{" "}
                  {l.destination.name}
                  {}
                </span>
              ))}
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
