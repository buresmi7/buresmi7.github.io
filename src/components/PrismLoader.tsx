'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Prism?: any;
  }
}

export default function PrismLoader() {
  useEffect(() => {
    // Dynamically import PrismJS to avoid SSR issues
    const loadPrism = async () => {
      // @ts-ignore - Dynamic import for client-side only
      const Prism = (await import('prismjs')).default;
      
      // Import common language components
      // @ts-ignore
      await import('prismjs/components/prism-bash');
      // @ts-ignore
      await import('prismjs/components/prism-json');
      // @ts-ignore
      await import('prismjs/components/prism-javascript');
      // @ts-ignore
      await import('prismjs/components/prism-typescript');
      // @ts-ignore
      await import('prismjs/components/prism-php');
      // @ts-ignore
      await import('prismjs/components/prism-python');
      // @ts-ignore
      await import('prismjs/components/prism-css');
      // @ts-ignore
      await import('prismjs/components/prism-markup');
      // @ts-ignore
      await import('prismjs/components/prism-sql');
      // @ts-ignore
      await import('prismjs/components/prism-yaml');
      // @ts-ignore
      await import('prismjs/components/prism-docker');
      
      // Highlight all code blocks
      Prism.highlightAll();
    };

    loadPrism().catch(console.error);
  }, []);

  return null;
}