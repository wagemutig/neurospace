"use client";

import { useState, type Ref } from "react";

/*
 * Buddy is the friendly shape that keeps you company. It is the timer during
 * an exercise: its colour drains as time runs out. It looks where the phone
 * leans, blinks, and changes its face with how steady you are. Tap it to poke it.
 *
 * The sway is set from outside through CSS variables on the wrapper:
 * --tilt-x, --tilt-r (rotation), --look-x and --look-y (pupils).
 */

export type Mood = "calm" | "wobbly" | "strong" | "happy";

const BODY =
  "M 120 20 C 168 20 222 56 224 118 C 226 180 186 222 120 222 C 58 222 16 184 18 116 C 20 56 72 20 120 20 Z";

type Props = {
  mood: Mood;
  color: string;
  // How much of the body is still in colour: 1 = full, 0 = empty.
  left: number;
  label?: string;
  wrapperRef?: Ref<HTMLDivElement>;
};

export function Buddy({ mood, color, left, label, wrapperRef }: Props) {
  const [pokes, setPokes] = useState(0);
  const finished = mood === "happy";

  return (
    <div
      ref={wrapperRef}
      className="buddy"
      data-mood={mood}
      role={label ? "img" : undefined}
      aria-label={label}
      onPointerDown={() => setPokes((n) => n + 1)}
    >
      {/* Keyed so each tap restarts the bounce. */}
      <div key={pokes} className={`buddy-body${pokes > 0 ? " poked" : ""}`}>
        <svg viewBox="0 0 240 240" aria-hidden="true">
          <path d={BODY} fill="var(--surface)" />
          <path
            d={BODY}
            fill={finished ? "var(--pulse)" : color}
            className="buddy-fill"
            style={{ clipPath: finished ? "none" : `inset(${(1 - left) * 100}% 0 0 0)` }}
          />

          {/* Brows only show when the sway is strong: a gentle, worried look (inner ends raised). */}
          <g className="brows" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M 70 94 Q 84 86 98 84" />
            <path d="M 170 94 Q 156 86 142 84" />
          </g>

          <g className="eyes">
            <g className="pupils">
              <circle cx="84" cy="112" r="10" fill="var(--ink)" />
              <circle cx="156" cy="112" r="10" fill="var(--ink)" />
              <circle cx="87" cy="108" r="3" fill="var(--paper)" />
              <circle cx="159" cy="108" r="3" fill="var(--paper)" />
            </g>
          </g>

          <circle cx="62" cy="140" r="10" fill="var(--reach)" opacity="0.45" />
          <circle cx="178" cy="140" r="10" fill="var(--reach)" opacity="0.45" />

          {/* Mouths: only the one for the current mood is shown. */}
          <g className="mouth mouth-calm" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M 100 146 Q 120 162 140 146" />
          </g>
          <g className="mouth mouth-wobbly">
            <ellipse cx="120" cy="150" rx="7" ry="8" fill="var(--ink)" />
          </g>
          <g className="mouth mouth-strong" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M 102 152 Q 111 146 120 152 Q 129 158 138 152" />
          </g>
          <g className="mouth mouth-happy" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M 94 142 Q 120 176 146 142" />
          </g>
        </svg>
      </div>
    </div>
  );
}
