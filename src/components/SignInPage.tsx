'use client'

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { LayoutGrid, ArrowRight } from "lucide-react";

export function SignInPage() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--cream)' }}
    >
      {/* Logo and branding */}
      <div className="text-center mb-8">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ background: 'var(--gk-green)' }}
        >
          <LayoutGrid className="w-8 h-8 text-white" />
        </div>
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          OpsMap
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'var(--text-secondary)' }}
        >
          Map your business operations
        </p>
      </div>

      {/* Sign in card */}
      <div 
        className="w-full max-w-sm p-8 rounded-2xl shadow-lg"
        style={{ 
          background: 'white',
          border: '1px solid var(--stone)'
        }}
      >
        <h2 
          className="text-xl font-semibold mb-2 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          Welcome back
        </h2>
        <p 
          className="text-sm mb-6 text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          Sign in to access your workspaces
        </p>

        <div className="space-y-3">
          <SignInButton mode="modal">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--gk-green)' }}
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </SignInButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--stone)' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-2"
                style={{ background: 'white', color: 'var(--text-muted)' }}
              >
                or
              </span>
            </div>
          </div>

          <SignUpButton mode="modal">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                background: 'var(--cream-light)',
                color: 'var(--text-primary)',
                border: '1px solid var(--stone)'
              }}
            >
              Create an account
            </button>
          </SignUpButton>
        </div>
      </div>

      {/* Footer */}
      <p 
        className="mt-8 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Built by Benali
      </p>
    </div>
  );
}
