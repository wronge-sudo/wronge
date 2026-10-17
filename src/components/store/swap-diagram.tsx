import { cn } from "@/lib/format";

/**
 * Schematic of the jacket back. step:
 * 1 = lift the yoke flap, 2 = unzip three sides, 3 = slide in a new panel, 4 = tuck & done
 */
export function SwapDiagram({ step, className }: { step: 1 | 2 | 3 | 4; className?: string }) {
  const acid = "#dcff3d";
  const zipOn = step === 2;
  return (
    <svg viewBox="0 0 200 200" className={cn("h-auto w-full", className)} aria-hidden>
      {/* body */}
      <path
        d="M58 30 L86 22 Q100 30 114 22 L142 30 L176 56 L188 132 L170 136 L160 82 L160 172 L40 172 L40 82 L30 136 L12 132 L24 56 Z"
        fill="#161616"
        stroke="#3a3a3a"
        strokeWidth="1.5"
      />
      {/* yoke */}
      <path d="M40 66 L160 66" stroke={step === 1 ? acid : "#3a3a3a"} strokeWidth={step === 1 ? 3 : 1.5} />
      {/* waistband */}
      <rect x="40" y="156" width="120" height="16" fill="#1f1f1f" stroke="#3a3a3a" strokeWidth="1.5" />
      {/* panel window */}
      <g
        style={{
          transform: step === 3 ? "translateY(-10px)" : "none",
          transition: "transform .4s",
        }}
      >
        <rect
          x="70"
          y="68"
          width="60"
          height="86"
          rx="2"
          fill={step === 2 ? "#0b0b0b" : step >= 3 ? "url(#art)" : "#262626"}
          stroke={step === 2 ? "#555" : "#0b0b0b"}
          strokeDasharray={step === 2 ? "3 3" : undefined}
        />
      </g>
      {/* zips: left, right, bottom */}
      <g stroke={zipOn ? acid : "#4a4a4a"} strokeWidth={zipOn ? 3 : 1.5} strokeDasharray="2 2.5" fill="none">
        <path d="M70 70 L70 154" />
        <path d="M130 70 L130 154" />
        <path d="M70 154 L130 154" />
      </g>
      {/* flap lift arrow */}
      {step === 1 && <path d="M100 60 L100 44 M93 51 L100 44 L107 51" stroke={acid} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {/* slide arrow */}
      {step === 3 && <path d="M100 120 L100 96 M92 104 L100 96 L108 104" stroke={acid} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {/* tick */}
      {step === 4 && (
        <g>
          <circle cx="150" cy="44" r="14" fill={acid} />
          <path d="M143 44 L148 49 L157 39" stroke="#0b0b0b" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      <defs>
        <linearGradient id="art" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4d1f" />
          <stop offset="0.5" stopColor="#dcff3d" />
          <stop offset="1" stopColor="#3d5afe" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const SWAP_STEPS = [
  { title: "Lift the flap", body: "Flip up the fabric flap under the shoulder yoke. The top edge of the panel is tucked in there." },
  { title: "Unzip 3 sides", body: "Open the left, right and bottom zips. They sit hidden under the seams, so you never see them." },
  { title: "Zip in new art", body: "Line up the new panel, zip all three sides shut, and it locks flat and taut." },
  { title: "Tuck & go", body: "Tuck the top edge under the yoke flap. Clean frame, brand-new jacket. Under a minute." },
] as const;
