'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, BarChart3, Shield, ChevronRight, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/auth/check');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAdminEmail(data.email || '');
      }
    } catch {
      // Not authenticated
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Credenciales incorrectas');
        return;
      }

      const res = await fetch('/api/admin/auth/check');
      if (!res.ok) {
        await supabase.auth.signOut();
        setError('No autorizado');
        return;
      }

      const data = await res.json();
      setAdminEmail(data.email || '');
      setIsAuthenticated(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setAdminEmail('');
    router.refresh();
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/providers', icon: Users, label: 'Profesionales', exact: false },
    { href: '/admin/registrations', icon: FileText, label: 'Solicitudes', exact: false },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', exact: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
          <span className="text-white font-bold text-xl">EC</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 px-4">
        <div className="max-w-md w-full">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
              <span className="text-white font-bold text-2xl">EC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EcuaCasa Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Acceso restringido</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all"
                  placeholder="admin@ecuacasa.com"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>
          </div>

          {/* Back to site */}
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-purple-600 transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Volver al sitio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">EC</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">Admin</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-100">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
                <span className="text-white font-bold text-lg">EC</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">EcuaCasa</p>
                <p className="text-xs text-gray-400">Panel Admin</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <p className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Menú</p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-purple-600' : ''}`} />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-purple-400" />}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6">
              <p className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sitio</p>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <Home className="w-[18px] h-[18px]" />
                Ver sitio público
              </Link>
            </div>
          </nav>

          {/* User & Logout */}
          <div className="p-3 border-t border-gray-100">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 w-full rounded-xl hover:bg-red-50 transition-all"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-20 lg:pt-0 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
