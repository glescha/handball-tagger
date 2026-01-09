type ToggleButtonProps = {
  label: string;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  selected?: boolean;
};

export function ToggleButton({
  label,
  selected = false,
  onToggle,
  disabled,
  className,
  title,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      data-selected={selected ? "true" : "false"}
      onClick={onToggle}
      disabled={disabled}
      className={["ui-toggle", className].filter(Boolean).join(" ")}
      aria-pressed={selected}
      title={title}
    >
      {label}
    </button>
  );
}
