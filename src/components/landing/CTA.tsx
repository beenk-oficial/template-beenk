import { NavLink } from "react-router";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-muted  to-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-primary-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of successful businesses already using our platform to grow and scale their operations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <NavLink to="/auth/signup">
            <Button size="lg" variant="secondary" >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </NavLink>
          <NavLink to="/contact">
            <Button size="lg" variant="outline" >
              Contact Sales
            </Button>
          </NavLink>
        </div>
        <p className="text-secondary-foreground text-sm mt-4">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}