import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-300",
        destructive:
          "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg hover:from-red-600 hover:to-rose-700 hover:shadow-xl transition-all duration-300 focus-visible:ring-red-500/20",
        outline:
          "border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all duration-300",
        secondary:
          "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-sm hover:from-slate-200 hover:to-slate-300 transition-all duration-300",
        ghost:
          "text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 transition-all duration-300",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-300",
        success:
          "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl transition-all duration-300",
        warning:
          "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:from-amber-600 hover:to-orange-700 hover:shadow-xl transition-all duration-300",
        purple:
          "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:from-purple-600 hover:to-violet-700 hover:shadow-xl transition-all duration-300",
        cyan: "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl transition-all duration-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
