const VARIANT_CLASS = {
  primary: "btn-primary",
  signal: "btn-signal",
  outline: "btn-outline",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

export default function Button({ variant = "signal", size, block, className = "", children, ...rest }) {
  const cls = [
    "btn",
    VARIANT_CLASS[variant] || VARIANT_CLASS.signal,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
