import { CalendarRange, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DATE_RANGE_PRESETS, granularityLabel, useDateRange } from "@/contexts/date-range";
import { cn } from "@/lib/utils";

const formatDay = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatRangeLabel = (from: Date, to: Date) => {
  const sameYear = from.getFullYear() === to.getFullYear();
  const fromLabel = formatDay(from);
  const toLabel = sameYear ? formatDay(to) : `${formatDay(to)}, ${to.getFullYear()}`;
  return `${fromLabel} - ${toLabel}`;
};

type Tab = "relative" | "calendar";

export function DateRangePicker() {
  const { range, setPreset, setCustomRange } = useDateRange();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(() => (range.preset === "custom" ? "calendar" : "relative"));
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);

  const isCustom = range.preset === "custom";
  const activePreset = DATE_RANGE_PRESETS.find((preset) => preset.id === range.preset);
  const triggerLabel = isCustom ? formatRangeLabel(range.from, range.to) : (activePreset?.label ?? "Select range");

  // Show the active range in the calendar, but fall back to a fresh draft once
  // the user starts clicking.
  const selected: DateRange | undefined = draft ?? { from: range.from, to: range.to };

  const handlePreset = (presetId: string) => {
    setPreset(presetId);
    setOpen(false);
  };

  // We drive the two-click flow off the clicked day rather than the range
  // react-day-picker computes: the first click always starts a new selection
  // (even when a full range is already shown), the second click closes it.
  const handleSelect = (_next: DateRange | undefined, selectedDay: Date) => {
    const inProgress = draft?.from && !draft.to;
    if (!inProgress) {
      setDraft({ from: selectedDay, to: undefined });
      return;
    }

    const start = draft.from!;
    const [from, to] = selectedDay.getTime() < start.getTime() ? [selectedDay, start] : [start, selectedDay];
    setCustomRange(from, to);
    setOpen(false);
    setDraft(undefined);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setDraft(undefined);
          setTab(range.preset === "custom" ? "calendar" : "relative");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <CalendarRange className="size-4" />
          {triggerLabel}
          <ChevronDown className={cn("size-4 opacity-80 transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-auto p-0">
        <div className="flex items-center gap-1 border-b px-2 pt-2">
          <TabButton active={tab === "relative"} onClick={() => setTab("relative")}>
            Quick filters
          </TabButton>
          <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")}>
            Custom
          </TabButton>
        </div>

        {tab === "relative" ? (
          <div className="grid w-80 grid-cols-2 gap-2 p-3">
            {DATE_RANGE_PRESETS.map((preset) => {
              const active = range.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePreset(preset.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:border-input hover:bg-accent hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3">
            <Calendar
              mode="range"
              numberOfMonths={2}
              showOutsideDays={false}
              defaultMonth={range.from}
              selected={selected}
              onSelect={handleSelect}
              disabled={{ after: new Date() }}
              // Calendar lives inside a popover; focusing it on open is intended keyboard UX.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="p-0"
            />
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                {draft?.from
                  ? formatRangeLabel(draft.from, draft.to ?? draft.from)
                  : formatRangeLabel(range.from, range.to)}
              </span>
              <span className="font-medium text-foreground">
                {draft?.from && !draft.to ? "Pick an end date" : `Grouped ${granularityLabel(range.granularity)}`}
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative -mb-px border-b-2 px-3 pb-2 pt-1 text-sm font-medium transition-colors",
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
