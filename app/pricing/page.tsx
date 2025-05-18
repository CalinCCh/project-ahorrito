import { PricingTable } from "@/components/pricing/PricingTable";

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-12 px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-2">
        Choose your plan
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Unlock premium features and take control of your finances. Select the
        plan that best fits your needs and start your journey today.
      </p>
      <PricingTable />
    </main>
  );
}
