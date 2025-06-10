import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardConfig from "./config";

// Añadimos configuración para optimizar la generación estática
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
};

const DashBoardLayout = ({ children }: Props) => {
  // Pass custom padding classes to DashboardLayout
  // paddingTopClass can remain default "pt-6" or be customized if needed
  // paddingBottomClass is set to "pb-0" for a minimal footer
  return (
    <>
      {/* Componente de configuración para prefetching */}
      <DashboardConfig />

      <DashboardLayout
        paddingTopClass="pt-6" // Restore top padding to lower header and content
        paddingBottomClass="pb-6" // Ensures minimal bottom padding for the dashboard pages
      >
        {children}
      </DashboardLayout>
    </>
  );
};

export default DashBoardLayout;
