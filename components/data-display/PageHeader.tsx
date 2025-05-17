import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  filterArea?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  filterArea,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`mb-6 bg-white rounded-2xl drop-shadow-sm px-6 py-5 flex flex-col lg:flex-row items-center lg:justify-between gap-4 ${className}`}
    >
      <div className="flex-1 min-w-0 text-center lg:text-left w-full lg:w-auto order-1">
        <h2 className="text-3xl font-bold text-slate-800 drop-shadow-sm truncate flex items-center justify-center lg:justify-start gap-2">
          {Icon && (
            <Icon className="size-7 text-slate-700 hidden lg:inline-block" />
          )}
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 font-medium mt-1 truncate">
            {description}
          </p>
        )}
      </div>

      {/* Section 2: Filter Area (Middle) - Centered, specific width if needed, or shrinks */}
      {filterArea && (
        <div className="flex justify-center w-full lg:w-auto order-3 lg:order-2">
          {filterArea}
        </div>
      )}

      {/* Section 3: Actions (Right) - Fixed size */}
      {actions && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto order-2 lg:order-3">
          {actions}
        </div>
      )}
    </div>
  );
}
