import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({ label, options, value, onChange, placeholder, error }: SelectProps) {
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`
              relative w-full cursor-pointer rounded-lg bg-white py-2.5 pl-4 pr-10 text-left 
              border border-[#e4e4e7] text-sm transition-all duration-200
              focus:outline-none focus:border-[#3b82f6] focus:ring-0
              shadow-[0_0_0_2px_rgba(59,130,246,0.4),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]
              ${error ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.4),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]" : ""}
            `}
          >
            <span className={`block truncate ${selected ? "text-[#242424]" : "text-[#a1a1aa]"}`}>
              {selected?.label || placeholder || "Select..."}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-[#898989]" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-gray-100 text-[#242424]" : "text-[#242424]"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#242424]">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}