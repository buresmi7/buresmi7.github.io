import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      {children}
      
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