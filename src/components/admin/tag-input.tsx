import React, { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  values,
  onChange,
  placeholder = "Type and press Enter or comma",
  className = "",
}) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const handleBlur = () => {
    if (input.trim()) addTag(input);
  };

  return (
    <div className={className}>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
        {label}
      </label>
      <div
        className="min-h-[40px] flex flex-wrap gap-1.5 rounded-lg border border-white/15 bg-[#0d0d0f] px-2.5 py-2 cursor-text focus-within:border-[#d4af37]/60"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-0.5 text-xs text-[#d4af37]"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              className="hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={handleBlur}
          placeholder={values.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
