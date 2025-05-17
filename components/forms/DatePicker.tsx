import * as React from "react";
import { format } from "date-fns";
import { CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value?: Date;
  onChange: SelectSingleEventHandler;
  disabled?: boolean;
};

export const DatePicker = ({ value, onChange, disabled }: Props) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal group", // Añadí "group"
            !value && "text-muted-foreground"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative size-4 mr-2">
            <CalendarIcon
              className={cn(
                "absolute size-4 transition-opacity duration-200",
                isHovered ? "opacity-0" : "opacity-100"
              )}
            />
            <CalendarDays
              className={cn(
                "absolute size-4 transition-opacity duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
          classNames={{
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "size-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer"
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
