// src/components/layout/Header.jsx - Polished Radix UI Floating Navbar
import React from 'react';
import * as Separator from '@radix-ui/react-separator';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import UserMenu from '../auth/UserMenu';

export default function Header() {
  return (
    <header 
      className="sticky top-6 z-50 mx-auto max-w-2xl px-4 mb-16"
      role="banner"
    >
      {/* Floating Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-6">
            
            {/* Brand Section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                MedSure
              </h1>
              <p className="text-[13px] text-gray-600 leading-relaxed mt-0.1">
                Drug interaction engine for Indian medications
              </p>
              
              <VisuallyHidden.Root>
                <p>MedSure - Drug interaction checker for Indian medications</p>
              </VisuallyHidden.Root>
            </div>

            {/* Visual Divider */}
            <Separator.Root 
              orientation="vertical"
              className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent" 
              decorative 
            />

            {/* User Actions */}
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
