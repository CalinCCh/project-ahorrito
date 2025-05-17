import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { CreditCard } from "lucide-react";

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
      className="flex items-center w-full cursor-pointer px-2 py-1 rounded-lg transition-all duration-200 group hover:bg-slate-50/90 hover:text-slate-800"
    >
      <div className="w-6 flex justify-center mr-1.5">
        <CreditCard className="size-3.5 shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-hover:scale-110" />
      </div>
      <span className="truncate transition-all duration-200 group-hover:font-medium">
        {account}
      </span>
    </div>
  );
};
