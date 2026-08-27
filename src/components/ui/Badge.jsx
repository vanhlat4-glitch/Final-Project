import { useLanguage } from "../../hooks/useLanguage";

const TONE_CLASS = {
  neutral: "badge-neutral",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
};

export default function Badge({ children, tone = "neutral" }) {
  const { t } = useLanguage();
  const text = typeof children === "string" ? t(children) : children;
  return <span className={`badge ${TONE_CLASS[tone] || TONE_CLASS.neutral}`}>{text}</span>;
}
