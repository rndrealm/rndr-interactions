interface IUserIconProps {
  color?: string;
  /** Rendered box in px; the 24-unit viewBox scales to it. */
  size?: number;
  /** Position when nested inside another SVG. */
  x?: number;
  y?: number;
}

export function UserIcon({
  color = "currentColor",
  size = 24,
  x,
  y,
}: IUserIconProps = {}) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.5 6.5C15.5 8.433 13.933 10 12 10C10.067 10 8.5 8.433 8.5 6.5C8.5 4.567 10.067 3 12 3C13.933 3 15.5 4.567 15.5 6.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11.9997 13C9.02123 13 6.67402 14.5539 5.43304 16.8621C4.59593 18.4191 6.02717 20 7.79494 20H16.2044C17.9722 20 19.4034 18.4191 18.5663 16.8621C17.3254 14.5539 14.9781 13 11.9997 13Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
