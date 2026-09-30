import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

interface HairlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "gold";
}

export function HairlineButton({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: HairlineButtonProps) {
  return <button type={type} className={`btn btn--${variant} ${className}`} {...rest} />;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, className = "", ...rest }: TextFieldProps) {
  return (
    <label className="field">
      <span className="sr-only">{label}</span>
      <input className={`field__input ${className}`} {...rest} />
    </label>
  );
}

export function RingBackdrop() {
  return (
    <div className="rings" aria-hidden="true">
      <span className="rings__ring rings__ring--1" />
      <span className="rings__ring rings__ring--2" />
      <span className="rings__ring rings__ring--3" />
    </div>
  );
}

export function TypeLockup({ size = "sm" }: { size?: "sm" | "hero" }) {
  return <span className={`lockup lockup--${size}`}>SYNCHRONIZE</span>;
}

interface VFChipProps {
  label: string;
  help: string;
  selected: boolean;
  shaking?: boolean;
  onToggle: () => void;
}

export function VFChip({ label, help, selected, shaking, onToggle }: VFChipProps) {
  return (
    <button
      type="button"
      className={`chip ${selected ? "is-selected" : ""} ${shaking ? "is-shaking" : ""}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="chip__label">{label}</span>
      <span className="chip__help">{help}</span>
    </button>
  );
}

interface KnobProps {
  label: string;
  help: string;
  value: number;
  onChange: (v: number) => void;
}

export function Knob({ label, help, value, onChange }: KnobProps) {
  return (
    <label className="knob">
      <span className="knob__head">
        <span className="label">{label}</span>
        <span className="knob__value">{value.toFixed(2)}</span>
      </span>
      <input
        className="knob__range"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="knob__help">{help}</span>
    </label>
  );
}
