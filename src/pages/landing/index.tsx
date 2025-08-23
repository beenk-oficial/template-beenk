import { useWhitelabel } from "@/hooks/useWhitelabel"
import { HeroSection } from "@/components/landing/HeroSection"
import { LogosSection } from "@/components/landing/LogosSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"

export default function LandingPage() {
  const { colors } = useWhitelabel()
  return (
    <>
      <HeroSection colors={colors} />
      <LogosSection colors={colors} />
      <FeaturesSection />
      <HowItWorksSection colors={colors} />
      <TestimonialsSection />
      <PricingSection colors={colors} />
      <FAQSection />
      <CTASection />
    </>
  )
}