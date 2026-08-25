import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/students", label: "All Students" },
  { href: "/admin/book", label: "Manage Book" },
  { href: "/admin/admins", label: "Manage Admins" },
  { href: "/admin/activity", label: "Activity Log" },
];

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      <div className="admin-nav-inner">
        <Link href="/admin" className="admin-brand">
          StepUp <span>Admin</span>
        </Link>

        <div className="admin-nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
