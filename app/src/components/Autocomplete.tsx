import { useEffect, useState } from "react";
import { TickerText } from "./TickerText";
import { titlize } from "../utils";

export const BasicAutocomplete = ({
  defaultValue,
  onChange,
  options,
  placeholder,
}: {
  defaultValue?: {
    code: string;
    autoFillName: string;
    city: string;
    state: string;
  };
  onChange: CallableFunction;
  options: {
    code: string;
    autoFillName: string;
    city: string;
    state: string;
  }[];
  placeholder?: string;
}) => {
  const [hiddenInput, setHiddenInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>(
    defaultValue ? defaultValue.code : "",
  );
  const [selectedOption, setSelectedOption] = useState<
    | {
        code: string;
        autoFillName: string;
        city: string;
        state: string;
      }
    | null
    | undefined
  >(defaultValue);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  useEffect(() => {
    const optionMatches = Boolean(
      options.filter(
        (option) =>
          option.city.startsWith(titlize(value)) ||
          option.code.startsWith(titlize(value)),
      ) && value.length > 0,
    );

    setShowOptions(optionMatches);
  }, [value, options]);

  useEffect(() => {
    onChange(selectedOption);
  }, [selectedOption]);

  useEffect(() => {
    if (selectedOption) {
      setHiddenInput(true);
      setShowOptions(false);
    } else {
      setHiddenInput(false);
    }
  }, [selectedOption]);

  return (
    <div className="flex flex-col">
      {hiddenInput ? (
        <button
          type="button"
          onClick={() => {
            setHiddenInput(false);
            setValue("");
            setSelectedOption(null);
          }}
          className="flex h-16 w-56 flex-col border border-blue-500 p-2 text-left font-mono hover:bg-blue-200"
        >
          <span className="text-xl font-bold">{selectedOption?.code}</span>
          <span className="text-sm text-gray-500">
            <TickerText
              text={`${selectedOption?.city.toUpperCase()}, ${selectedOption?.state.toUpperCase()}`}
            />
          </span>
        </button>
      ) : null}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        hidden={hiddenInput}
        className={`${value.length > 1 ? "border border-blue-500" : "border-b"} h-16 w-56 font-mono text-xl`}
      />
      {showOptions ? (
        <div
          className="mt-16 flex w-56 flex-col gap-4 border border-t-0 bg-white shadow-sm"
          style={{ position: "absolute" }}
        >
          {options
            .filter(
              (option) =>
                option.city.startsWith(titlize(value)) ||
                option.code.startsWith(titlize(value)),
            )
            .map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setValue(option.code);
                  setSelectedOption(option);
                }}
                className="p-1 text-left font-mono hover:bg-blue-500 hover:text-white"
              >
                {option.autoFillName}
              </button>
            ))
            .slice(0, 5)}
        </div>
      ) : null}
    </div>
  );
};
