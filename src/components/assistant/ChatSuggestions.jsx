export default function ChatSuggestions({ suggestions = [], onSelect, disabled = false }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="px-3 pt-2 pb-1 border-t border-[#F0F4F1] bg-[#FAFCFB]">
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${index}-${suggestion}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className="text-left text-xs font-medium text-[#1B4D3E] bg-white hover:bg-[#E5EBE7] active:bg-[#D5DDD7] border border-[#D0DDD5] rounded-xl px-3 py-1.5 shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
