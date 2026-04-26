import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-[#898989] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#242424] 
            placeholder:text-[#a1a1aa] outline-none transition-all duration-200
            focus:border-[#3b82f6] focus:ring-0
            shadow-[0_0_0_2px_rgba(59,130,246,0.4),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]
            disabled:opacity-50 disabled:cursor-not-allowed resize-none
            ${error ? "border-red-500 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.4),rgba(19,19,22,0.7)_0px_1px_5px_-4px,rgba(34,42,53,0.05)_0px_4px_8px_0px]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";