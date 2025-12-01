"use client";

/**
 * 🔥 PieGenreChart Component
 * -------------------------------------------------------
 * Displays a fully interactive pie chart showing the
 * user’s music genre distribution.
 *
 * FEATURES:
 * - Beautiful neon-green Spotify gradient colors
 * - Smooth slice animation + hover response
 * - Dark-mode tooltip theme
 * - Centered labels (readable + clean)
 * - ResponsiveContainer for perfect scaling
 * - Fully commented for clarity
 * -------------------------------------------------------
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Each genre data item: { name: "Pop", value: 25 }
interface GenreData {
  name: string;
  value: number;
}

interface Props {
  data: GenreData[];
}

/**
 * Spotify-inspired neon gradient palette.
 * These rotate automatically depending on number of items.
 */
const COLORS = [
  "#1DB954", // bright Spotify green
  "#1ed760",
  "#20e27a",
  "#17c964",
  "#15b257",
  "#13a34d",
];

export default function PieGenreChart({ data }: Props) {
  return (
    <div className="bg-black/40 p-6 rounded-xl shadow-lg border border-gray-800 backdrop-blur-sm">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200 tracking-wide">
        Genre Breakdown
      </h2>

      {/* Responsive container ensures chart scales properly */}
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={data as any[]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}   // donut style for aesthetic
            outerRadius={110}  // main size
            paddingAngle={3}   // spacing between slices
            label={(props: any) => `${props.name}: ${props.value}%`}
            labelLine={false}  // keep UI clean
            animationDuration={1200}
          >
            {/* Each slice gets a Spotify neon color */}
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          {/* Tooltip — beautiful dark mode, rounded edges */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              padding: "10px",
            }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />

          {/* Legend for category visibility */}
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: "#ccc", fontSize: "13px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
