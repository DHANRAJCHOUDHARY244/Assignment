import Link from "next/link";

import { SociallyApprovedClient } from "@/components/carousel/SociallyApprovedClient";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="page-shell pb-0">
        <SiteHeader />
      </div>
      <SociallyApprovedClient />
    </main>
  );
}
