"use client";

/**
 * 📈 LineChartMinutes Component
 * -------------------------------------------------------
 * Displays minutes listened over time (daily/weekly/monthly).
 *
 * FEATURES:
 * - Smooth "monotone" curve (beautiful Spotify-style line)
 * - Dark-mode UI with Spotify neon greens
 * - Interactive hover dots w/ glow
 * - Responsive container for all screen sizes
 * - Smart date formatter → "Nov 30" instead of raw timestamps
 * - Elegant tooltip styling (blurred background, rounded edges)
 * - Fully commented for clarity
 * -------------------------------------------------------
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Array<{ date: string; minutes: number }>;
}

export default function LineChartMinutes({ data }: Props) {
  /**
   * 🧠 Format dates into something readable.
   * Backend might send "2025-11-30" → show "Nov 30"
   */
  const formatDate = (raw: string) => {
    const d = new Date(raw);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-black/40 p-6 rounded-xl shadow-lg border border-gray-800 backdrop-blur-sm">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200 tracking-wide">
        Minutes Listened Over Time
      </h2>

      {/* Responsive wrapper ensures proper scaling */}
      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 25, left: 0, bottom: 10 }}
        >
          {/* Subtle grid pattern */}
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          {/* X-Axis → formatted date labels */}
          <XAxis
            dataKey="date"
            stroke="#ccc"
            fontSize={12}
            tick={{ fill: "#ddd" }}
            tickFormatter={(value: string) => formatDate(value)}
          />

          {/* Y-Axis → minutes listened */}
          <YAxis
            stroke="#ccc"
            fontSize={12}
            tick={{ fill: "#ddd" }}
          />

          {/* Interactive tooltip */}
          <Tooltip
            cursor={{ stroke: "#1DB954", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              padding: "10px",
            }}
            labelFormatter={(value: string) => `Date: ${formatDate(value)}`}
            formatter={(val: number) => [`${val} min`, "Minutes"]}
          />

          {/* Animated line */}
          <Line
            type="monotone"
            dataKey="minutes"
            stroke="#1DB954"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#1DB954",
              stroke: "#1DB954",
            }}
            activeDot={{
              r: 8,
              stroke: "#1DB954",
              strokeWidth: 2,
              fill: "#1DB954",
            }}
            animationDuration={1400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
