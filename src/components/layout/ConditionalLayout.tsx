'use client';

import { Header } from './Header';
import { Footer } from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 lg:pt-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
