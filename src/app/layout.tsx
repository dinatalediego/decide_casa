import './globals.css';
import type { Metadata } from 'next';
import PostHogClient from '@/components/PostHogClient';

export const metadata: Metadata = {
  title: 'DecideCasa | Leads calificados + ranking explicable',
  description: 'Captura leads y entrega recomendaciones explicables para acelerar cierres inmobiliarios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PostHogClient />
        {children}
      </body>
    </html>
  );
}
