import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDEN — Analizador de productos MercadoLibre",
  description: "Puntúa oportunidades de negocio en MercadoLibre Argentina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
