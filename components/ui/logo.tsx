import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.jpg";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center sm:min-h-0 sm:min-w-0" aria-label="Code Plus">
      <Image src={logo} alt="Code Plus" width={32} height={32} />
    </Link>
  );
}
