/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#eef2f5",
        ink: "#0f172a",
        workshop: {
          navy: "#0f172a",
          steel: "#334155",
          blue: "#2563eb",
          amber: "#f59e0b",
          green: "#059669",
          red: "#dc2626",
        },
      },
      boxShadow: {
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)",
        panel: "0 1px 2px rgba(15, 23, 42, 0.05), 0 16px 38px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
