
function StatCard({ title, value, icon: Icon, description, tone = "sky" }) {
  const tones = {
    navy: "bg-[#142D4E]/10 text-[#142D4E]",
    sky: "bg-[#4F86F7]/10 text-[#4F86F7]",
    green: "bg-[#16A34A]/10 text-[#16A34A]",
  };

  const iconStyle = tones[tone] || tones.sky;

  return (
    <article className="flex min-h-[200px] flex-col rounded-2xl border border-[#DCE4EF] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="min-h-12 text-sm font-medium text-[#142D4E]/65">
          {title}
        </p>

        {Icon && (
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
            <Icon className="size-5" />
          </span>
        )}
      </div>

      <p className="mt-auto pt-3 text-3xl font-bold tracking-tight text-[#142D4E]">
        {value ?? 0}
      </p>

      {description && (
        <p className="mt-1 text-sm text-[#142D4E]/65">
          {description}
        </p>
      )}
    </article>
  );
}

export default StatCard;
