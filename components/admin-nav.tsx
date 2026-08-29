"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/students", label: "All Students" },
  { href: "/admin/courses", label: "Manage Courses" },
  { href: "/admin/mock-tests", label: "Mock Tests" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/notes", label: "Notes" },
  { href: "/admin/live-classes", label: "Live Classes" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/book", label: "Manage Book" },
  { href: "/admin/admins", label: "Manage Admins" },
  { href: "/admin/activity", label: "Activity Log" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      <div className="admin-nav-inner">
        <Link href="/" className="admin-brand" aria-label="StepUp Academy home">
          <span className="admin-brand-mark">S</span>
          <span>StepUp</span>
        </Link>
        <div className="admin-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
