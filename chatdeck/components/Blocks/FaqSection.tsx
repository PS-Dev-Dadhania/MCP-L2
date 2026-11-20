import { SparklesIcon, ServerIcon, TerminalIcon, CpuIcon, HelpCircleIcon, PlusIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqSection() {
  const items = [
    {
      icon: SparklesIcon,
      title: "What is TripPlanner?",
      content:
        "TripPlanner is an AI travel assistant that creates complete day-by-day itineraries for weekend trips and vacations. It checks current weather, finds top sights, estimates costs, suggests packing essentials, and exports everything to your calendar.",
    },
    {
      icon: ServerIcon,
      title: "How does it find live data?",
      content:
        "TripPlanner connects directly to open data sources for live weather (Open-Meteo), verified landmarks (Wikipedia), and airport/transit guides. This ensures your itinerary is grounded in real facts, not made-up information.",
    },
    {
      icon: CpuIcon,
      title: "Can I save the itinerary to my calendar?",
      content:
        "Yes. One click on the 'Add to Calendar' button downloads an .ics file that imports directly into Google Calendar, Apple Calendar, and Microsoft Outlook with all times and locations.",
    },
    {
      icon: TerminalIcon,
      title: "Can I customize the trip length and style?",
      content:
        "Yes. You can select 2, 3, or 5 days, and choose your preferred trip style, including Sightseeing, Work Retreat, Culture, or Relaxed.",
    },
    {
      icon: HelpCircleIcon,
      title: "Is it free to use?",
      content:
        "Yes. All the destination, weather, attraction, and budget tools use open, free APIs without any paywalls.",
    },
  ];

  return (
    <div id="faq" className="py-24 sm:py-32 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-neutral-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Everything you need to know about TripPlanner.
        </p>
      </div>
      <Accordion className="max-w-4xl mx-auto" defaultValue={["item-1"]}>
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`} className="border-neutral-200 dark:border-neutral-800">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200 font-semibold text-left">
                <item.icon className="size-4.5 text-violet-500 shrink-0" />
                <span>{item.title}</span>
              </span>
              <PlusIcon className="text-neutral-400 ml-auto size-4 shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
