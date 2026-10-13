
function DashboardUI() {
  const stats = [
    {
      title: "My Skills",
      value: "08",
      description: "Skills to teach or learn",
      symbol: "✦",
    },
    {
      title: "Mentor Requests",
      value: "03",
      description: "Requests to review",
      symbol: "↗",
    },
    {
      title: "Sessions",
      value: "02",
      description: "Upcoming learning sessions",
      symbol: "◷",
    },
    {
      title: "Communities",
      value: "04",
      description: "Communities to explore",
      symbol: "◎",
    },
  ];

  const actions = [
    {
      title: "Explore Skills",
      description: "Find skills you want to learn.",
      link: "/skills",
    },
    {
      title: "View Sessions",
      description: "Check your learning sessions.",
      link: "/sessions",
    },
    {
      title: "Explore Communities",
      description: "Connect with other learners.",
      link: "/communities",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              SKILL EXCHANGE PLATFORM
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your learning journey in one place.
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            Learner Dashboard
          </span>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                  {stat.symbol}
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {stat.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Continue with your learning activities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <article
                key={action.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {action.description}
                </p>

                <a
                  href={action.link}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Open page <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-8 text-xs text-slate-400">
          UI preview — statistics are sample values and are not connected
          to the backend yet.
        </p>
      </div>
    </main>
  );
}

export default DashboardUI;
