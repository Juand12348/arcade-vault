import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono, Courier_Prime } from "next/font/google";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

// Mismas familias y pesos que el <link> de Google Fonts en references/templates/Arcade Vault.html
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier",
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Juega online y compite por la mayor cantidad de puntos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pressStart.variable} ${jetbrains.variable} ${courier.variable}`}
    >
      <body>
        <div className="av-bg" />
        <div className="av-noise" />
        {/* #root: el tema (styles.css) lo usa como contenedor flex de la app */}
        <div id="root">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  );
}
