import {
  FormEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { BasicAutocomplete } from "./Autocomplete";
import { DaySelector } from "./DaySelector";
import { STATIONS } from "../assets/stations";

export const SearchBar = ({
  isLoading,
  onSubmit,
  setDirection,
}: {
  isLoading: boolean;
  setDirection: Dispatch<SetStateAction<"trip" | "reverseTrip">>;
  onSubmit: (values: {
    originCode: string;
    destinationCode: string;
    days: string;
  }) => void;
}) => {
  const [fromValue, setFromValue] = useState<{
    code: string;
    autoFillName: string;
    city: string;
    state: string;
  }>();

  const [toValue, setToValue] = useState<{
    code: string;
    autoFillName: string;
    city: string;
    state: string;
  }>();

  const [formContext, setFormContext] = useState<{
    originCode: string;
    destinationCode: string;
    days: string;
  }>({
    originCode: "",
    destinationCode: "",
    days: "",
  });

  useEffect(() => {
    setFormContext((prev) => ({
      ...prev,
      originCode: fromValue ? fromValue.code : "",
      destinationCode: toValue ? toValue.code : "",
    }));
  }, [fromValue, toValue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formContext);
  };

  return (
    <form
      onSubmit={(event) => handleSubmit(event)}
      className="flex items-center gap-4 border p-8 shadow-sm"
    >
      <BasicAutocomplete
        key={fromValue ? fromValue.code : "fromvalue"}
        defaultValue={fromValue}
        onChange={(value: {
          code: string;
          autoFillName: string;
          city: string;
          state: string;
        }) => {
          if (value) {
            setFromValue(value);
          }
        }}
        options={STATIONS}
        placeholder="From"
      />
      <button
        disabled={isLoading}
        type="button"
        onClick={() => {
          const from = fromValue;
          setFromValue(toValue);
          setToValue(from);
          setDirection((prev) => (prev === "trip" ? "reverseTrip" : "trip"));
        }}
        className="flex h-16 w-16 place-items-center justify-center border"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-2 -3 24 24"
          className="m-1 w-full bg-gray-300 fill-white p-4 hover:bg-blue-500"
        >
          <path d="M11.774 15l1.176 1.176a1 1 0 0 1-1.414 1.414l-2.829-2.828a1 1 0 0 1 0-1.414l2.829-2.829a1 1 0 0 1 1.414 1.415L11.883 13H14a4 4 0 1 0 0-8 1 1 0 0 1 0-2 6 6 0 1 1 0 12h-2.226zM8.273 3L7.176 1.904A1 1 0 0 1 8.591.489l2.828 2.829a1 1 0 0 1 0 1.414L8.591 7.56a1 1 0 0 1-1.415-1.414L8.323 5H6a4 4 0 1 0 0 8 1 1 0 0 1 0 2A6 6 0 1 1 6 3h2.273z"></path>
        </svg>
      </button>
      <BasicAutocomplete
        key={toValue ? toValue.code : "tovalue"}
        defaultValue={toValue}
        onChange={(value: {
          code: string;
          autoFillName: string;
          city: string;
          state: string;
        }) => {
          if (value) {
            setToValue(value);
          }
        }}
        options={STATIONS}
        placeholder="To"
      />
      <DaySelector
        onChange={(value: string) => {
          setFormContext((prev) => ({ ...prev, days: value }));
        }}
      />
      <div
        className={`${formContext.originCode && formContext.destinationCode && formContext.days ? "border border-blue-500" : "border"} flex h-16`}
      >
        <button
          disabled={
            !formContext.originCode ||
            !formContext.destinationCode ||
            !formContext.days ||
            isLoading
          }
          className={`${formContext.originCode && formContext.destinationCode && formContext.days ? "bg-blue-500" : "bg-gray-300"} m-1 w-full px-3 font-mono text-xl text-white`}
          type="submit"
        >
          Search
        </button>
      </div>
    </form>
  );
};
