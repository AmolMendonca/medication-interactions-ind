// src/components/auth/UserMenu.jsx - Rebuilt with Radix UI
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Mail, Shield, CheckCircle } from 'lucide-react';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
      setShowSignOutDialog(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user?.email) return 'User';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100/60 hover:bg-gray-200/60 active:bg-gray-300/60 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 group"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900 hidden sm:inline pr-1">
              {getUserDisplayName()}
            </span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[240px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            sideOffset={8}
            align="end"
          >
            {/* User Info Section */}
            <div className="px-3 py-3 mb-1 border-b border-gray-200/60">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">
                    {getUserDisplayName()}
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                    <Mail className="w-3 h-3" />
                    <p className="truncate font-medium">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <DropdownMenu.Item
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 cursor-default outline-none"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">Active</p>
                <p className="text-xs text-gray-500">Account verified</p>
              </div>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-gray-200/60 my-2" />

            {/* Security Info */}
            <DropdownMenu.Item
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 cursor-default outline-none"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                <Shield className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">Secure Sync</p>
                <p className="text-xs text-gray-500">End-to-end encrypted</p>
              </div>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-gray-200/60 my-2" />

            {/* Sign Out */}
            <DropdownMenu.Item
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              onSelect={() => setShowSignOutDialog(true)}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span>Sign Out</span>
            </DropdownMenu.Item>

            <DropdownMenu.Arrow className="fill-white/95" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog.Root open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 mx-4">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-6">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>

            {/* Title & Description */}
            <AlertDialog.Title className="text-2xl font-bold text-gray-900 text-center mb-3">
              Sign Out?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 text-center text-base leading-relaxed mb-8">
              Your medications are safely synced to the cloud. You can sign back in anytime to access them.
            </AlertDialog.Description>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 rounded-xl font-semibold text-base transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  disabled={isSigningOut}
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold text-base shadow-lg shadow-red-500/30 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSigningOut ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing out...
                    </span>
                  ) : (
                    'Sign Out'
                  )}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
