type Props = {
  status: "active" | "archived";
  activeLabel: string;
  archivedLabel: string;
};

// مكوّن UI بحت — يُعاد استخدامه بأي مكان يعرض حالة طالب
export function StatusBadge({ status, activeLabel, archivedLabel }: Props) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-green-50 text-green-700"
          : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {isActive ? activeLabel : archivedLabel}
    </span>
  );
}
