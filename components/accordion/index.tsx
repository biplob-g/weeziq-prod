import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion as ShadcnAccordion,
} from "@/components/ui/accordion";

type Props = {
  trigger: string;
  content: string;
  id?: string; // Add id prop
};

const Accordion = ({ trigger, content, id }: Props) => {
  return (
    <ShadcnAccordion type="single" collapsible>
      <AccordionItem
        className="mb-2 border-2 px-2 rounded-xl"
        value={id || "item-1"}
      >
        <AccordionTrigger className="cursor-pointer">
          {trigger}
        </AccordionTrigger>
        <AccordionContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </AccordionContent>
      </AccordionItem>
    </ShadcnAccordion>
  );
};

export default Accordion;
