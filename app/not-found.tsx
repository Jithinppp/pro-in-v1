import { Button } from "@/components";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <h1 className="text-8xl font-semibold text-[#242424] mb-4">404</h1>
        <p className="text-xl text-[#898989] mb-8">Page not found</p>
        <p className="text-sm text-[#898989] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
}