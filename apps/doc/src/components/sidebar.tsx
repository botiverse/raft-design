import { Link } from "@tanstack/react-router";

const NAV = [
  {
    title: "Getting Started",
    items: [{ label: "Introduction", to: "/" }],
  },
  {
    title: "Components",
    items: [{ label: "Button", to: "/components/button" }],
  },
] as const;

export function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-200 px-5 py-6">
      <Link to="/" className="block text-sm font-semibold tracking-tight text-gray-900">
        slock-ui
      </Link>
      <nav className="mt-8 space-y-7">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    activeProps={{ className: "bg-gray-100 font-medium text-gray-900" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
