import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cremona/ui/accordion";

/** One section open at a time; `collapsible` lets the open one close. */
export default function Single() {
  return (
    <Accordion type="single" collapsible defaultValue="shipping" className="w-full max-w-md">
      <AccordionItem value="shipping">
        <AccordionTrigger>Do you ship worldwide?</AccordionTrigger>
        <AccordionContent>Yes, to more than 40 countries, in 3 to 7 days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>What is the return policy?</AccordionTrigger>
        <AccordionContent>Thirty days, no questions asked.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I reach support?</AccordionTrigger>
        <AccordionContent>By email, every day of the week.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Each trigger sits in a heading: `headingLevel` fits it to the outline of the page. */
export function Multiple() {
  return (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger headingLevel={4}>Design tokens</AccordionTrigger>
        <AccordionContent>Colours, radii and fonts follow the theme.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger headingLevel={4}>Accessibility</AccordionTrigger>
        <AccordionContent>Names, keyboard and focus are built in.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
