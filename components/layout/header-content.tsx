'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Home,
  Package,
  Phone,
  LogIn,
  LayoutDashboard
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface HeaderContentProps {
  session: any;
  status: string;
}

export function HeaderContent({ session, status }: HeaderContentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();

  const cartItemsCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Debug logging
  console.log('HeaderContent - Session status:', status);
  console.log('HeaderContent - Session data:', session);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-border/50 shadow-soft">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-agricultural-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-300 group-hover:scale-105">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient">MD Agricole</span>
              <span className="text-xs text-muted-foreground font-medium">Matériel Agricole</span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link href="/" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium">
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </Link>
            <Link href="/catalogue" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium">
              <Package className="h-4 w-4" />
              <span>Catalogue</span>
            </Link>
            <Link href="/contact" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium">
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Panier */}
            <Link href="/panier">
              <Button variant="outline" size="lg" className="relative hover-lift shadow-soft hover:shadow-medium">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs font-bold bg-primary text-primary-foreground shadow-medium">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {session ? (
              <div className="hidden lg:flex items-center space-x-3">
                {/* Admin Dashboard Link */}
                {session?.user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="hover-lift shadow-soft hover:shadow-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="ml-2 font-medium">Admin</span>
                    </Button>
                  </Link>
                )}
                <Link href="/profil">
                  <Button variant="outline" size="lg" className="hover-lift shadow-soft hover:shadow-medium">
                    <User className="h-5 w-5" />
                    <span className="ml-2 font-medium">{session?.user?.name || 'Profil'}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="hover-lift shadow-soft hover:shadow-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/auth/connexion" className="hidden lg:block">
                <Button size="lg" className="btn-primary hover-lift">
                  <LogIn className="h-5 w-5 mr-2" />
                  Connexion
                </Button>
              </Link>
            )}

            {/* Menu Mobile */}
            <Button
              variant="outline"
              size="lg"
              className="lg:hidden hover-lift shadow-soft hover:shadow-medium"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border/50 bg-white/95 backdrop-blur-lg">
            <div className="py-6 space-y-4">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Accueil</span>
                </Link>
                <Link
                  href="/catalogue"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  <span>Catalogue</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Phone className="h-5 w-5" />
                  <span>Contact</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-border/50">
                {session ? (
                  <div className="flex flex-col space-y-3">
                    {/* Admin Dashboard Link Mobile */}
                    {session?.user?.role == 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full justify-start h-12 shadow-soft hover:shadow-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                          <LayoutDashboard className="h-5 w-5 mr-3" />
                          <span className="font-medium">Administration</span>
                        </Button>
                      </Link>
                    )}
                    <Link
                      href="/profil"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start h-12 shadow-soft hover:shadow-medium">
                        <User className="h-5 w-5 mr-3" />
                        <span className="font-medium">{session?.user?.name || 'Profil'}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 shadow-soft hover:shadow-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span className="font-medium">Déconnexion</span>
                    </Button>
                  </div>
                ) : (
                  <Link
                    href="/auth/connexion"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full h-12 btn-primary">
                      <LogIn className="h-5 w-5 mr-3" />
                      <span className="font-medium">Connexion</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
