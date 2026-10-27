import type { SVGProps } from "react";

/** Line icons for the mobile menu tiles (28px, drawn on the sand tile). The viewBox is cropped so the drawing fills the box. */
const base = {
  viewBox: "2.5 2.5 23 23",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.05,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Two fanned art panels; the front one shows a sun over hills. */
export function PanelsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="5" width="12" height="17" rx="1.6" transform="rotate(-9 10.5 13.5)" />
      <g transform="rotate(7 17 15)">
        <rect x="11" y="6.5" width="12" height="17" rx="1.6" className="fill-sand" />
        <circle cx="19.4" cy="10.8" r="1.4" />
        <path d="M12.9 20.6 15.9 15.7l1.8 2.8 1.6-2 2 4.1" />
      </g>
    </svg>
  );
}

/** Front of a trucker jacket: pointed collar, button placket, flap pockets, waistband. */
export function JacketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10.5 4 7 5.5Q5 6.3 4.6 8.5L3 21.5q-.1.8.7.9l1.9.2q.7 0 .8-.7l.8-8.4v11q0 .5.5.5h12.6q.5 0 .5-.5v-11l.8 8.4q.1.7.8.7l1.9-.2q.8-.1.7-.9L23.4 8.5Q23 6.3 21 5.5L17.5 4" />
      <path d="M10.5 4q3.5 2 7 0M10.5 4l-.7 4.2 3 1.8 1.2-2.4 1.2 2.4 3-1.8-.7-4.2M14 7.6V25M7.2 22.5h13.6" />
      <path d="M8.8 11.5h3.4v3.1l-1.7.8-1.7-.8zM15.8 11.5h3.4v3.1l-1.7.8-1.7-.8z" />
    </svg>
  );
}
