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
