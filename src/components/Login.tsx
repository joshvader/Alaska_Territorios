'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError('El correo electrónico o la contraseña son incorrectos.');
      setIsLoading(false);
      return;
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-burgundy-light/20 flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
      {/* Background abstract visual decorations */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-burgundy/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-burgundy/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-150 shadow-xl p-8 relative z-10 transition-all duration-300 hover:shadow-2xl">
        {/* Logo and Brand */}
        <div className="text-center space-y-2 mb-8 select-none">
          <div className="w-12 h-12 rounded-2xl bg-burgundy flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-burgundy/25">
            📊
          </div>
          <h1 className="text-2xl font-black text-burgundy tracking-tight mt-3">DataForge Manager</h1>
          <p className="text-sm font-semibold text-gray-500">Panel de Administración de Territorios</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-burgundy-light border border-burgundy/15 rounded-xl text-burgundy text-sm font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="admin@territorios.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-burgundy transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forget */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 select-none">
            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-burgundy focus:ring-burgundy cursor-pointer"
              />
              <span>Recordarme</span>
            </label>
            <button type="button" onClick={() => alert('Recuperación en desarrollo')} className="hover:text-burgundy hover:underline transition">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-burgundy hover:bg-burgundy-hover disabled:bg-burgundy/60 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-250 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 select-none">
          <p className="font-semibold text-gray-500">Credenciales de Acceso:</p>
          <p className="mt-1">Usuario: <code className="bg-gray-100 px-1 py-0.5 rounded text-burgundy font-mono">admin@territorios.com</code></p>
          <p className="mt-0.5">Contraseña: <code className="bg-gray-100 px-1 py-0.5 rounded text-burgundy font-mono">admin123</code></p>
        </div>
      </div>
    </div>
  );
}
