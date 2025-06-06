import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { cn } from "@/lib/utils";
import { renderIconWithBackground, renderIcon } from "@/lib/icon-mapper.js";
import { TriangleAlert, Hash } from "lucide-react";

type Props = {
  id: string;
  category: string | null;
  categoryId: string | null;
  emoji?: string | null;
  icon?: string | null;
};

export const CategoryColumn = ({
  id,
  category,
  categoryId,
  emoji,
  icon,
}: Props) => {
  const { onOpen: onOpenCategory } = useOpenCategory();

  const { onOpen: onOpenTransaction } = useOpenTransaction();

  const onClick = () => {
    if (categoryId) {
      onOpenCategory(categoryId);
    } else {
      onOpenTransaction(id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center w-full cursor-pointer px-2 rounded-lg transition-all duration-300 group h-11 max-w-full",
        "hover:bg-gradient-to-r hover:from-white hover:to-slate-50/80",
        "hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5",
        "border border-transparent hover:border-slate-200/50",
        "backdrop-blur-sm",
        !category && "text-slate-500"
      )}
    >
      <div className="mr-2 transition-all duration-300 group-hover:rotate-1 flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {!category ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-50 to-red-100 shadow-md shadow-red-100/50 border border-red-200/40">
            <TriangleAlert className="size-3 text-red-600" />
          </div>
        ) : icon ? (
          <div className="w-8 h-8 flex items-center justify-center">{renderIconWithBackground(icon)}</div>
        ) : emoji ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-md shadow-blue-100/50 border border-blue-200/40">
            <span className="text-sm">{emoji}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-md shadow-gray-100/50 border border-gray-200/40">
            <Hash className="size-3 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <span className="block truncate text-sm font-normal text-slate-800 group-hover:text-slate-900 transition-colors duration-200">
          {category || "Uncategorized"}
        </span>
      </div>
    </div>
  );
};
