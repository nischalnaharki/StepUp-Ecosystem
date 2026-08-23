import Link from "next/link";
export function AdminNav(){return <nav className="admin-nav"><Link href="/admin">Dashboard</Link><Link href="/admin/students">All Students</Link><Link href="/admin/book">Manage Book</Link><Link href="/admin/admins">Manage Admins</Link></nav>}
