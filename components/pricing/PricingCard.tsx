import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  priceId: string;
  onSubscribe: (priceId: string) => void;
  isLoading?: boolean;
  isFeatured?: boolean;
}

export function PricingCard({
  name,
  description,
  price,
  priceId,
  onSubscribe,
  isLoading,
  isFeatured,
}: PricingCardProps) {
  return (
    <Card
      className={`flex flex-col h-full shadow-md border ${
        isFeatured ? "border-blue-500 scale-105" : "border-gray-200"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-700">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold mb-2">{price}</div>
        <div className="text-gray-600 text-sm mb-4 min-h-[40px]">
          {description}
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="w-full"
          onClick={() => onSubscribe(priceId)}
          disabled={isLoading}
        >
          {isLoading ? "Redirecting..." : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
}
