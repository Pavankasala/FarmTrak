// src/components/Tooltip.jsx
/**
 * Simple accessible tooltip that shows on hover or focus.
 * Usage: <Tooltip text="Helpful hint here" />
 */
export default function Tooltip({ text }) {
  return (
    <span className="relative inline-flex items-center group" tabIndex={0}>
      <svg
        xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
        className="h-4 w-4 ml-1 text-blue-500 dark:text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
      </svg>
      <span
        role="tooltip"
        aria-hidden="true"
        className={`
          absolute left-1/2 -translate-x-1/2 -top-8 w-max max-w-xs px-2 py-1
          rounded-md bg-gray-900 text-white text-xs shadow-md
          opacity-0 pointer-events-none translate-y-1
          group-hover:opacity-100 group-hover:-translate-y-1
          group-focus:opacity-100 group-focus:-translate-y-1
          transition-all duration-150
        `}
      >
        {text}
      </span>
    </span>
  );
}