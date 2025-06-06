import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn

type Props = {
  account: string;
  accountId: string;
};

export const AccountColumn = ({ account, accountId }: Props) => {
  const { onOpen: onOpenAccount } = useOpenAccount();

  const onClick = () => {
    onOpenAccount(accountId);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center w-full cursor-pointer px-2 rounded-lg transition-all duration-300 group h-11 max-w-full", // Added max-w-full
        "hover:bg-gradient-to-r hover:from-white hover:to-slate-50/80",
        "hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5",
        "border border-transparent hover:border-slate-200/50",
        "backdrop-blur-sm"
      )}
    >
      <div className="w-5 flex justify-center mr-1 flex-shrink-0">
        {" "}
        {/* Added flex-shrink-0, reduced margin */}
        <CreditCard className="size-3 shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-200" />{" "}
        {/* Reduced icon size */}
      </div>
      <span className="truncate transition-all duration-200 text-slate-800 group-hover:text-slate-900 flex-1 min-w-0">
        {" "}
        {/* Added flex-1 min-w-0 for proper truncation */}
        {account}
      </span>
    </div>
  );
};
