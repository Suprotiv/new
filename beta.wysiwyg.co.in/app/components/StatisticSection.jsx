"use client";

import Counter from "./Counter";
import EditableText from "./EditableText";
import FadeIn from "./FadeIn";

const stats = [
  {
    from: 0,
    to: 1600,
    valueKey: "home.stats.1.value",
    labelKey: "home.stats.1.label",
    subLabelKey: "home.stats.1.subLabel",
    label: "Projects done",
    subLabel:
      "From global campaigns to local identities — and everything in between.",
    suffix: "+",
    format: (val) => `${Math.floor(val)}+`,
  },
  {
    from: 0,
    to: 34,
    valueKey: "home.stats.2.value",
    labelKey: "home.stats.2.label",
    subLabelKey: "home.stats.2.subLabel",
    label: "Years of experience",
    subLabel: "Designing with intent since 1992.",
    suffix: "+",
  },
  {
    from: 0,
    to: 500,
    valueKey: "home.stats.3.value",
    labelKey: "home.stats.3.label",
    subLabelKey: "home.stats.3.subLabel",
    label: "Satisfied clients",
    subLabel: "Across industries and continents.",
    suffix: "+",
  },
  {
    from: 0,
    to: 200,
    valueKey: "home.stats.4.value",
    labelKey: "home.stats.4.label",
    subLabelKey: "home.stats.4.subLabel",
    label: "Leads generated",
    subLabel: "Helping clients grow their reach — one lead at a time.",
    format: (val) => `${val.toLocaleString()}+`,
  },
];

export default function StatisticSection() {
  return (
    <section className="bg-[#111010] text-white pt-20">
      <FadeIn>
        <div className="max-w-[80vw] mx-auto  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-15  text-center ">
          {stats.map((stat, index) => (
            <StatBlock stat={stat} key={index} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function StatBlock({ stat }) {
  const parseStatValue = (value) => {
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : stat.to;
  };

  return (
    <div>
      <div className="text-4xl  mb-2">
        <div className="flex font-medium text-5xl gap-1 justify-center items-center">
          {stat.prefix || ""}
          <EditableText
            keyName={stat.valueKey}
            fallback={String(stat.to)}
          >
            {(value) => (
              <span className="inline-flex items-baseline whitespace-nowrap">
                <Counter from={stat.from} to={parseStatValue(value)} />
                {stat.suffix || "+"}
              </span>
            )}
          </EditableText>
        </div>
      </div>
      <div className="text-xl mt-5">
        <EditableText keyName={stat.labelKey} fallback={stat.label} />
      </div>
      <div className="text-sm text-gray-400 mt-1">
        <EditableText
          keyName={stat.subLabelKey}
          fallback={stat.subLabel}
          multiline
        />
      </div>
    </div>
  );
}
