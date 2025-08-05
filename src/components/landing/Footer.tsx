import { NavLink } from "react-router";
import { Zap, Twitter, Github, Linkedin } from 'lucide-react';
import { useWhitelabel } from '@/hooks/useWhitelabel';

export default function Footer() {
  const { name, logo } = useWhitelabel();

  return (
    <footer className="bg-background text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <NavLink to="/" className="flex items-center cursor-pointer">
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="w-full h-8 object-contain"
                />
              </NavLink>
            </div>
            <p className="text-secondary-foreground mb-4">
              The complete platform for building and scaling your micro-SaaS business.
            </p>
            <div className="flex space-x-4">
              <Twitter className="h-5 w-5 text-secondary-foreground hover:text-white cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-secondary-foreground hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-secondary-foreground hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-secondary-foreground">
              <li><NavLink to="#features" className="hover:text-white transition-colors">Features</NavLink></li>
              <li><NavLink to="#pricing" className="hover:text-white transition-colors">Pricing</NavLink></li>
              <li><NavLink to="/demo" className="hover:text-white transition-colors">Demo</NavLink></li>
              <li><NavLink to="/integrations" className="hover:text-white transition-colors">Integrations</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-secondary-foreground">
              <li><NavLink to="/about" className="hover:text-white transition-colors">About</NavLink></li>
              <li><NavLink to="/blog" className="hover:text-white transition-colors">Blog</NavLink></li>
              <li><NavLink to="/careers" className="hover:text-white transition-colors">Careers</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-white transition-colors">Contact</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-secondary-foreground">
              <li><NavLink to="/help" className="hover:text-white transition-colors">Help Center</NavLink></li>
              <li><NavLink to="/docs" className="hover:text-white transition-colors">Documentation</NavLink></li>
              <li><NavLink to="/privacy" className="hover:text-white transition-colors">Privacy Policy</NavLink></li>
              <li><NavLink to="/terms" className="hover:text-white transition-colors">Terms of Service</NavLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary mt-8 pt-8 text-center text-secondary-foreground">
          <p>&copy; 2024 MicroSaaS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}