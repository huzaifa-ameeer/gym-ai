type ButtonOptions = {
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  full?: boolean;
};

export function buttonClass({
  variant = "primary",
  size = "md",
  full = false,
}: ButtonOptions = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,box-shadow,transform,color] duration-200 active:scale-[0.98]";
  const sizes = {
    md: "h-10 px-6 text-sm",
    lg: "h-11 px-7 text-sm",
  };
  const variants = {
    primary:
      "bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20",
    secondary:
      "border border-line bg-surface text-foreground hover:bg-accent-soft",
  };

  return [base, sizes[size], variants[variant], full ? "w-full" : ""]
    .filter(Boolean)
    .join(" ");
}
