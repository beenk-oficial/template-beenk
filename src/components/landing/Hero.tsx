import { NavLink } from "react-router";
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-muted  to-primary pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-secondary-foreground mb-6">
            Build Your Business
            <span className="text-primary-foreground block">Faster Than Ever</span>
          </h1>
          <p className="text-xl text-secondary-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete micro-SaaS platform that helps entrepreneurs launch, 
            grow, and scale their businesses with powerful tools and insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NavLink to="/auth/signup">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </NavLink>
            <Button variant="outline" size="lg" className="group">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-secondary-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        <div className="mt-20">
          <div className="bg-white rounded-xl shadow-2xl p-4 max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
                <p className="text-gray-600">Product Demo Video</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}