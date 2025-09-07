import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header>
        <h1>Hermelínové peklo</h1>
        <p className="author">Michal Bureš</p>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer>
        <section>
          <p>
            © 2025 <a href="mailto:michal.ezop@gmail.com">Michal Bureš</a>.
            Vytvořeno s Next.js a <a href="https://latex.now.sh/">LaTeX.css</a>.
          </p>
        </section>
      </footer>
    </div>
  );
}