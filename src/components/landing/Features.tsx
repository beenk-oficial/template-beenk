import { Shield, Zap, BarChart3, Users, Globe, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with modern technology for blazing fast performance and user experience.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption and compliance standards.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time insights and detailed analytics to track your business growth.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Seamless collaboration tools for teams of all sizes and structures.'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Worldwide infrastructure ensuring fast access from anywhere on the planet.'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Fully responsive design optimized for mobile devices and tablets.'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you build, launch, and grow your business efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200"
            >
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}