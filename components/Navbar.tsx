import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "PROIN";

interface NavbarProps {
  email: string;
}

export function Navbar({ email }: NavbarProps) {
  return (
    <nav className="h-16 border-b border-[#e4e4e7] bg-white px-6 flex items-center justify-between">
      <Link href="/" className="text-lg font-semibold text-[#242424] tracking-tight">
        {APP_NAME}
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#898989]">{email}</span>
        <LogoutButton className="text-sm text-[#898989] hover:text-[#242424] flex items-center gap-2 transition-colors" />
      </div>
    </nav>
  );
}