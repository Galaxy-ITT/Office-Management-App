import Link from "next/link";

export default function SidebarLink({ href, label, icon }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition">
      <div className="w-6 h-6">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
