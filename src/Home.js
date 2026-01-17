import React from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./Dashboard.css";
import PolaroidSlideshow from "./PolaroidSlideshow";

/* ---------------- EXECUTIVE DATA ---------------- */

const metroFareData = [
  { slab: "1–2", fare: 10 },
  { slab: "3–4", fare: 20 },
  { slab: "5–6", fare: 30 },
  { slab: "7–8", fare: 40 },
  { slab: "9–10", fare: 50 },
  { slab: "11–15", fare: 60 },
  { slab: "16–20", fare: 70 },
  { slab: "21–25", fare: 80 },
  { slab: "26+", fare: 90 },
];

const metroRidership = [
  { date: "Aug 2024", riders: 917365 },
  { date: "Dec 2024", riders: 902000 },
  { date: "Feb 2025", riders: 750000 },
  { date: "Apr 2025", riders: 908153 },
  { date: "Jun 2025", riders: 966732 },
];

const bmtcFinance = [
  { year: "2019", revenue: 2293, cost: 2643 },
  { year: "2020", revenue: 2120, cost: 2669 },
  { year: "2021", revenue: 1853, cost: 2017 },
  { year: "2022", revenue: 2115, cost: 2293 },
  { year: "2023", revenue: 2938, cost: 3015 },
  { year: "2024", revenue: 2614, cost: 3189 },
  { year: "2025", revenue: 2768, cost: 3539 },
];

const fareboxRecovery = [
  { year: "2019", ratio: 69.6 },
  { year: "2020", ratio: 67.7 },
  { year: "2021", ratio: 34.7 },
  { year: "2022", ratio: 40.2 },
  { year: "2023", ratio: 53.8 },
  { year: "2024", ratio: 63.5 },
  { year: "2025", ratio: 57.6 },
];

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  return (
    <div className="page relative overflow-hidden bg-gradient-to-b from-gray-900 to-black">

      {/* HERO SECTION (unchanged) */}
      <section className="typeform-hero relative z-10 pt-10">
        <div className="hero-content-wrapper">
          <div className="typeform-hero-content">
            <span className="typeform-tag">
              Urban Mobility Intelligence
            </span>

            <h1 className="typeform-title text-white">
              Data for the <span className="gradient-text-blue">City</span>.<br />
              Decisions for the <span className="gradient-text-purple">Future</span>.
            </h1>

            <p className="typeform-subtitle text-gray-300">
              Evidence-driven insights on Bengaluru’s public transport economics.
            </p>
          </div>

          <div className="hero-image-container">
            <PolaroidSlideshow />
          </div>
        </div>
      </section>

      {/* ================= EXECUTIVE ANALYTICS SECTION ================= */}
      <section className="relative z-10 mt-12 px-10 pb-24">
        <h2 className="text-white text-center text-3xl font-semibold mb-4">
          Bengaluru Transit — Executive Snapshot
        </h2>
        <p className="text-gray-400 text-center max-w-3xl mx-auto mb-14">
          Fare policy, ridership response, and operating sustainability of
          Namma Metro and BMTC — aligned with ROI modelling objectives.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">

          {/* METRO FARE SLABS */}
          <div className="glass-card">
            <h3 className="chart-title">Namma Metro — Fare Slabs (₹)</h3>
            <ResponsiveContainer height={260}>
              <BarChart data={metroFareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="slab" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="fare" fill="#60a5fa" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* METRO RIDERSHIP SHOCK */}
          <div className="glass-card">
            <h3 className="chart-title">Metro Ridership — Policy Shock</h3>
            <ResponsiveContainer height={260}>
              <LineChart data={metroRidership}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="riders"
                  stroke="#a78bfa"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BMTC REVENUE VS COST */}
          <div className="glass-card">
            <h3 className="chart-title">BMTC — Revenue vs Operating Cost</h3>
            <ResponsiveContainer height={260}>
              <BarChart data={bmtcFinance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" />
                <Bar dataKey="cost" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FAREBOX RECOVERY */}
          <div className="glass-card">
            <h3 className="chart-title">BMTC — Farebox Recovery (%)</h3>
            <ResponsiveContainer height={260}>
              <LineChart data={fareboxRecovery}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ratio"
                  stroke="#facc15"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* FOOTNOTE */}
        <p className="text-gray-500 text-xs text-center mt-16">
          Metrics shown are operating-level indicators for planning and ROI
          modelling. Net losses include depreciation and capital interest.
        </p>
      </section>
    </div>
  );
}
