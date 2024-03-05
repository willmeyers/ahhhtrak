import { useEffect, useState, useRef } from "react";

const getMonthName = (index: number) => {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "Novemeber",
    "December",
  ][index];
};

const daysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const DaySelector = ({ onChange }: { onChange: CallableFunction }) => {
  const currentDate = new Date();
  if (
    currentDate.getDate() >
    daysInMonth(currentDate.getMonth() + 1, currentDate.getFullYear()) - 3
  ) {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const daysOfMonth: Date[] = [];
  for (
    let i = 1;
    i <= daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    i++
  ) {
    daysOfMonth.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
    );
  }

  const [value, setValue] = useState<string>("");

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selecting, setSelecting] = useState<boolean>(false);

  const [state, setState] = useState<{
    month: number;
    year: number;
    days: Date[];
  }>({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    days: daysOfMonth,
  });

  const [activeDays, setActiveDays] = useState<Date[]>([]);

  const calendarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // @ts-expect-error: calendarRef.current is not null
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateStateMonthYear = (month: number, year: number) => {
    if (month < 0) {
      month = 11;
    }

    if (month > 11) {
      month = 0;
    }

    if (year < currentDate.getFullYear()) return;
    if (year > currentDate.getFullYear() + 2) return;

    const newDate = new Date(year, month, 1);

    if (
      newDate.getDate() >=
      daysInMonth(newDate.getMonth() + 1, newDate.getFullYear()) - 3
    ) {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    const daysOfMonth: Date[] = [];
    for (
      let i = 1;
      i <= daysInMonth(newDate.getMonth(), newDate.getFullYear());
      i++
    ) {
      daysOfMonth.push(new Date(newDate.getFullYear(), newDate.getMonth(), i));
    }

    setState(() => ({
      year: newDate.getFullYear(),
      month: newDate.getMonth(),
      days: daysOfMonth,
    }));
  };

  const toggleActiveDate = (date: Date) => {
    const exists = Boolean(
      activeDays.find((d) => d.toISOString() === date.toISOString()),
    );

    exists
      ? setActiveDays((prev) =>
          prev.filter((d) => d.toISOString() !== date.toISOString()),
        )
      : setActiveDays((prev) => [...prev, date]);
  };

  useEffect(() => {
    setValue("");

    for (const date of activeDays) {
      const offset = date.getTimezoneOffset();
      const awareDate = new Date(date.getTime() - offset * 60 * 1000);
      setValue((prev) =>
        (prev + " " + awareDate.toISOString().split("T")[0]).trim(),
      );
    }
  }, [activeDays]);

  useEffect(() => {
    onChange(value);
  }, [value]);

  return (
    <div>
      <input
        readOnly
        type="text"
        value={
          value.split(" ").length > 1
            ? `${value.split(" ").length} days`
            : value
        }
        onClick={() => setShowCalendar(true)}
        placeholder="Select days"
        className={`
          ${activeDays.length > 0 ? "border border-blue-500" : "border-b"}
        h-16 w-56 cursor-pointer pl-2 font-mono text-xl`}
      />
      {showCalendar ? (
        <div
          ref={calendarRef}
          style={{ position: "absolute" }}
          className="border bg-white p-2 shadow-sm"
        >
          <div className="flex w-72 justify-between">
            <div>
              <button
                type="button"
                onClick={() =>
                  updateStateMonthYear(state.month - 1, state.year)
                }
                className="bg-blue-500 px-2 py-1 text-sm text-white"
              >
                ⏴
              </button>
              <span className="px-2 py-1 font-mono text-sm">
                {getMonthName(state.month)}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateStateMonthYear(state.month + 1, state.year)
                }
                className="bg-blue-500 px-2 py-1 text-sm text-white"
              >
                ⏵
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() =>
                  updateStateMonthYear(state.month, state.year - 1)
                }
                className="bg-blue-500 px-2 py-1 text-sm text-white"
              >
                ⏴
              </button>
              <span className="px-2 py-1 font-mono text-sm">{state.year}</span>
              <button
                type="button"
                onClick={() =>
                  updateStateMonthYear(state.month, state.year + 1)
                }
                className="bg-blue-500 px-2 py-1 text-sm text-white"
              >
                ⏵
              </button>
            </div>
          </div>
          <div className="h-8 w-8"></div>
          <div
            className="flex w-72 flex-wrap justify-evenly gap-1"
            onMouseDown={() => setSelecting(true)}
            onMouseUp={() => setSelecting(false)}
            onMouseLeave={() => setSelecting(false)}
          >
            {state.days.map((i) => (
              <button
                type="button"
                key={`${i.toISOString()}-btn`}
                className={`${
                  activeDays.find((d) => d.toISOString() === i.toISOString())
                    ? "bg-blue-500 text-white hover:bg-blue-500"
                    : "bg-gray-100"
                } h-8 w-8 font-mono text-sm hover:bg-blue-300`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  toggleActiveDate(i);
                }}
                onMouseOver={() => {
                  if (selecting) {
                    toggleActiveDate(i);
                  }
                }}
              >
                {i.getDate()}
              </button>
            ))}
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
          </div>
          <button
            onClick={() => setShowCalendar(false)}
            className="bg-blue-500 p-1 font-mono text-sm text-white"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
};
