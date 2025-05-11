import { ReactNode } from "react";
import { ChamaSidebar } from "./ChamaSidebar";
import { ChamaHeader } from "./ChamaHeader";

interface ChamaLayoutProps {
  children: ReactNode;
}

export default function ChamaLayout({ children }: ChamaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <ChamaHeader />
      <div className="flex h-[calc(100vh-4rem)]">
        <ChamaSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 md:ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
