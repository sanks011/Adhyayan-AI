import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { RoomManagerProvider } from "../components/RoomManagerProvider";

const outfitFont = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Adhyayan AI",
  description: "The best AI powered interactive learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Eczar:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force dark mode and prevent any theme changes, plus strip extension-injected attributes
              (function() {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                localStorage.setItem('theme', 'dark');
                
                // Watch for class changes and enforce dark mode
                const classObserver = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                      if (!document.documentElement.classList.contains('dark')) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.classList.remove('light');
                      }
                    }
                  });
                });
                
                classObserver.observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: ['class']
                });

                // Clean up browser extension attributes (e.g., Buster CAPTCHA solver) to prevent hydration mismatches
                const cleanExtensions = function() {
                  document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                  });
                  if (document.body) {
                    document.body.removeAttribute('bis_register');
                    // Remove any processed or bis-injected attributes on body
                    const attrs = Array.from(document.body.attributes);
                    attrs.forEach(function(attr) {
                      if (attr && (attr.name.startsWith('__processed_') || attr.name.startsWith('bis_'))) {
                        document.body.removeAttribute(attr.name);
                      }
                    });
                  }
                };

                const extObserver = new MutationObserver(function(mutations) {
                  let needsClean = false;
                  for (let i = 0; i < mutations.length; i++) {
                    const mutation = mutations[i];
                    if (mutation.type === 'attributes') {
                      const name = mutation.attributeName;
                      if (name === 'bis_skin_checked' || name === 'bis_register' || (name && (name.startsWith('__processed_') || name.startsWith('bis_')))) {
                        needsClean = true;
                        break;
                      }
                    } else if (mutation.type === 'childList') {
                      needsClean = true;
                    }
                  }
                  if (needsClean) {
                    cleanExtensions();
                  }
                });

                extObserver.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true
                });

                // Run clean on load events
                window.addEventListener('DOMContentLoaded', cleanExtensions);
                window.addEventListener('load', cleanExtensions);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfitFont.variable} antialiased bg-neutral-950 text-white`}
        suppressHydrationWarning
      >
        <Providers>
          <RoomManagerProvider>
            {children}
          </RoomManagerProvider>
          <Analytics/>
        </Providers>
      </body>
    </html>
  );
}
