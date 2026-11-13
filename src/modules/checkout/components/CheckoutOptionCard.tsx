import { cn } from "@/src/lib/utils";

interface CheckoutOptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  title: string;
  detail: string;
}

export default function CheckoutOptionCard({
  name,
  value,
  checked,
  onChange,
  icon,
  title,
  detail,
}: CheckoutOptionCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-xl p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
        checked
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {icon}
      <span className="font-semibold">{title}</span>
      <span
        className={cn(
          "text-xs",
          checked
            ? "text-primary-foreground/80"
            : "text-secondary-foreground/70",
        )}
      >
        {detail}
      </span>
    </label>
  );
}
