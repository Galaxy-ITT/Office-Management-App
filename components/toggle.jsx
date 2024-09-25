import { FaBars } from "react-icons/fa";

export default function SidebarToggle() {
  return (
    <button className="text-muted-foreground hover:text-accent-foreground transition">
      <FaBars />
    </button>
  );
}
