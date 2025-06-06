import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatPercentage } from "@/lib/utils";
import { CategoryToolTip } from "@/components/charts/CategoryTooltip";

const COLORS = ["#0062FF", "#12C6FF", "#FF647F", "#FF9354", "#8B5CF6"];

type Props = {
  data: {
    name: string;
    value: number;
  }[];
  currency?: string;
};

export const PieVariant = ({ data = [], currency = "EUR" }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          wrapperStyle={{ paddingTop: '10px' }}
          content={({ payload }): any => {
            return (
              <ul className="flex flex-col space-y-1">
                {payload?.map((entry: any, index: number) => (
                  <li
                    key={`item-${index}`}
                    className="flex items-center space-x-1.5"
                  >
                    <span
                      className="size-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex items-center space-x-1 text-xs">
                      <span className="text-muted-foreground truncate max-w-[80px]">
                        {entry.value}
                      </span>
                      <span className="font-medium">
                        {formatPercentage(entry.payload.percent * 100)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }}
        />
        <Tooltip content={<CategoryToolTip currency={currency} />} />
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={75}
          innerRadius={50}
          paddingAngle={2}
          fill="#8884d8"
          dataKey="value"
          labelLine={false}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
