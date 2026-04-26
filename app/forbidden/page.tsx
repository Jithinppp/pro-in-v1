import { Button } from "@/components";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <h1 className="text-8xl font-semibold text-[#242424] mb-4">403</h1>
        <p className="text-xl text-[#898989] mb-8">Access denied</p>
        <p className="text-sm text-[#898989] mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
}