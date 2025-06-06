import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { cn } from "@/lib/utils";
import { renderIcon } from "@/lib/icon-mapper";
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
        "flex items-center w-full cursor-pointer px-2 py-1 rounded-lg transition-all duration-200 group hover:bg-slate-50/90 hover:text-slate-800", // Restored hover effects
        !category && "text-slate-500"
      )}
    >
      <div className="w-6 h-6 flex justify-center items-center mr-1.5">
        {!category ? (
          <TriangleAlert className="size-3.5 shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-hover:scale-110" /> // Restored hover effects
        ) : icon ? (
          renderIcon(icon, {
            className:
              "size-3.5 shrink-0 text-slate-600 group-hover:text-slate-800 transition-transform duration-200 group-hover:scale-110", // Restored hover effects
          })
        ) : emoji ? (
          <span className="text-lg transition-transform duration-200 group-hover:scale-110">
            {" "}
            {/* Restored hover effects */}
            {emoji}
          </span>
        ) : (
          <Hash className="size-3.5 shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-hover:scale-110" /> // Restored hover effects
        )}
      </div>
      <span className="truncate transition-all duration-200 group-hover:font-medium">
        {" "}
        {/* Restored hover effects */}
        {category || "Uncategorized"}
      </span>
    </div>
  );
};
