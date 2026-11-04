import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg: "#FFF7F8", primary: "#D96C91", rose: "#9D174D", blush: "#F5C9D7", sage: "#A8BFA5", ink: "#35252C", mute: "#806A73" },
    fontFamily: { serif: ["Georgia", "Cambria", "serif"], sans: ["system-ui", "sans-serif"] },
    boxShadow: { xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  } },
  plugins: [],
} satisfies Config;
