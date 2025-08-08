import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'MD Agricole - Matériel Agricole en Tunisie',
  description: 'MD Agricole, votre partenaire de confiance pour tout matériel agricole en Tunisie. Tracteurs, outils, équipements d\'irrigation et plus.',
  keywords: 'tracteur, matériel agricole, tunisie, john deere, massey ferguson, irrigation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
