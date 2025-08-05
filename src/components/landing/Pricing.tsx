import { NavLink } from "react-router";
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$9',
    description: 'Perfect for individuals and small projects',
    features: [
      'Up to 5 projects',
      'Basic analytics',
      'Community support',
      '1GB storage',
      'Standard templates'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '$29',
    description: 'Ideal for growing businesses and teams',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'Premium templates',
      'Team collaboration',
      'Custom integrations'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Professional',
      'Custom development',
      '24/7 phone support',
      'Unlimited storage',
      'Advanced security',
      'SLA guarantee',
      'Dedicated manager'
    ],
    popular: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg ${
                plan.popular ? 'border-2 border-primary scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <NavLink to="/auth/signup" className="block">
                <Button 
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-secondary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </NavLink>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan? <NavLink to="/contact" className="text-secondary hover:underline">Contact us</NavLink>
          </p>
        </div>
      </div>
    </section>
  );
}