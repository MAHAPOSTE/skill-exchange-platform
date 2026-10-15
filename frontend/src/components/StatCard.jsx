function StatCard({ title, value, icon: Icon, description, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">{title}</p>
        {Icon && (
          <span
            className={`flex size-9 shrink-0 sm:size-10 items-center justify-center rounded-xl ${tones[tone]}`}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl sm:mt-4 sm:text-3xl font-bold tracking-tight text-slate-900">
        {value ?? 0}
      </p>
      {description && (
        <p className="mt-1 text-xs text-slate-500 sm:mt-1.5 sm:text-sm">{description}</p>
      )}
    </article>
  );
}

export default StatCard;
