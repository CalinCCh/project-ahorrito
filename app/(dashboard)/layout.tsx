import { DashboardLayout } from "@/components/layout/DashboardLayout";

type Props = {
  children: React.ReactNode;
};

const DashBoardLayout = ({ children }: Props) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashBoardLayout;
