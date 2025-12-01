"use client";

/**
 * 🎧 BarChartArtists Component
 * -------------------------------------------------------
 * Displays a fully interactive bar chart showing the top
 * artists and the minutes the user streamed them.
 *
 * FEATURES:
 * - Smooth animation on load + hover
 * - Responsive container (auto resizes)
 * - Styled dark-mode tooltip (Spotify UI vibes)
 * - Handles long artist names elegantly
 * - Clean colors + rounded bar corners
 * - Fully commented so every line is clear
 * -------------------------------------------------------
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Each artist's data structure
interface ArtistData {
  name: string;     // Artist name
  minutes: number;  // Total minutes streamed
}

// Props: component expects an array of artist objects
interface Props {
  data: ArtistData[];
}

export default function BarChartArtists({ data }: Props) {
  return (
    <div className="bg-black/40 p-6 rounded-xl shadow-lg border border-gray-800 backdrop-blur-sm">
      {/* Chart Title */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200 tracking-wide">
        Top Artists By Listening Time
      </h2>

      {/* Responsive container ensures the chart scales to screen size */}
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
        >
          {/* Grid lines for readability */}
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          {/* X-Axis → artist names */}
          <XAxis
            dataKey="name"
            stroke="#ccc"
            fontSize={12}
            tick={{ fill: "#ddd" }}
            interval={0}
            height={60} // ensures space for long names
            tickFormatter={(value: string) =>
                value.length > 10 ? value.slice(0, 10) + "…" : value
            }
              
          />

          {/* Y-Axis → Minutes listened */}
          <YAxis
            stroke="#ccc"
            tick={{ fill: "#ddd" }}
            fontSize={12}
          />

          {/* Tooltip → on-hover details */}
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }} // subtle hover glow
            contentStyle={{
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              padding: "10px",
            }}
            labelStyle={{ color: "#1DB954" }}
            formatter={(value) => [`${value} min`, "Minutes Listened"]}
          />

          {/* Bars themselves */}
          <Bar
            dataKey="minutes"
            fill="#1DB954"              // Spotify green
            radius={[6, 6, 0, 0]}      // rounded top corners
            animationDuration={1200}   // satisfying animation
            maxBarSize={60}            // prevents bars from being too wide
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
