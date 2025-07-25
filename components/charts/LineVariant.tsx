import { format } from "date-fns";

import {
  Tooltip,
  XAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import { CustomTooltip } from "@/components/charts/CustomTooltip";

type Props = {
  data: {
    date: string;
    income: number;
    expenses: number;
  }[];
  currency?: string;
};

export const LineVariant = ({ data, currency = "EUR" }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => format(value, "dd MMM")}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Line
          dot={false}
          dataKey="income"
          stroke="#3b82f6"
          strokeWidth={2}
          className="drop-shadow-sm"
        />

        <Line
          dot={false}
          dataKey="expenses"
          stroke="#f43f5e"
          strokeWidth={2}
          className="drop-shadow-sm"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
