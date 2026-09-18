export const ChevronDownIcon = ({
  className,
  pathClassName,
}: {
  className?: string;
  pathClassName?: string;
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M5.75 9.5L12 15.75L18.25 9.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClassName}
    />
  </svg>
);
