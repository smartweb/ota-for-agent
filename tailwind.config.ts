import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 龙虾品牌主色
        brand: {
          50: "#FFF3ED",
          100: "#FFE2D4",
          200: "#FFC5A8",
          300: "#FF9D70",
          400: "#FF7541",
          500: "#FF5A1F", // 主色 龙虾橙红
          600: "#E63E00",
          700: "#B53000",
          800: "#822300",
          900: "#521700",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        hover: "0 4px 24px rgba(0,0,0,0.08)",
      },
      keyframes: {
        // 顶部进度条：从左滑到右并淡出
        loadingBar: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateX(250%)", opacity: "0" },
        },
        // skeleton 光泽流动
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // 文案省略号轻跳
        dotBounce: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "40%": { transform: "translateY(-3px)", opacity: "1" },
        },
      },
      animation: {
        "loading-bar": "loadingBar 1.4s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "dot-bounce": "dotBounce 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
