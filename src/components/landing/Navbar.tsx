'use client';

import { useState } from 'react';
import { NavLink } from "react-router";
import { Button } from '@/components/ui/button';
import { Menu, X, Zap } from 'lucide-react';
import { useWhitelabel } from '@/hooks/useWhitelabel';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { name, logo } = useWhitelabel();

  return (
    <nav className="bg-background border-b border-primary/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center cursor-pointer">
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-full h-8 object-contain"
              />
            </NavLink>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLink to="#features" className="text-secondary-foreground  transition-colors">
                Features
              </NavLink>
              <NavLink to="#pricing" className="text-secondary-foreground  transition-colors">
                Pricing
              </NavLink>
              <NavLink to="#testimonials" className="text-secondary-foreground  transition-colors">
                Testimonials
              </NavLink>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </NavLink>
            <NavLink to="/auth/signup">
              <Button>Get Started</Button>
            </NavLink>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-foreground "
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <NavLink to="#features" className="block px-3 py-2 text-secondary-foreground ">
                Features
              </NavLink>
              <NavLink to="#pricing" className="block px-3 py-2 text-secondary-foreground ">
                Pricing
              </NavLink>
              <NavLink to="#testimonials" className="block px-3 py-2 text-secondary-foreground ">
                Testimonials
              </NavLink>
              <div className="border-t pt-4 mt-4">
                <NavLink to="/auth/signin" className="block px-3 py-2">
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </NavLink>
                <NavLink to="/auth/signup" className="block px-3 py-2">
                  <Button className="w-full">Get Started</Button>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}