import type { BlogBlock } from "@/lib/blog-posts";

/**
 * 渲染博客正文块。支持 h2 / p / ul / quote / code。
 * 纯 server component，无客户端逻辑。
 */
export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="text-xl font-bold tracking-tight mt-10 mb-1">
                {b.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="text-[15px] leading-7 text-neutral-700">
                {b.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[15px] leading-7 text-neutral-700"
                  >
                    <span className="text-brand-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-brand-300 bg-brand-50/40 px-5 py-3 rounded-r-lg text-[15px] text-neutral-700 italic"
              >
                {b.text}
              </blockquote>
            );
          case "code":
            return (
              <pre
                key={i}
                className="bg-neutral-900 text-neutral-100 rounded-xl p-4 overflow-x-auto text-[13px] leading-6"
              >
                <code>{b.text}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
