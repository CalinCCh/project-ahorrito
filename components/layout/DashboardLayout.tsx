import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex relative">
        <Sidebar />
        <main className="flex-1 lg:pl-64 pt-28 mx-auto w-full px-1 pb-10 -mt-20">
          <div className="max-w-screen-2xl mx-auto w-full">{children}</div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};
