import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

export function PricingSection({ colors }: { colors: Record<string, string> }) {
  const { t } = useTranslation("landing")
  const plans = {
    monthly: [
      {
        name: t("pricing_starter"),
        price: "R$49",
        monthly: true,
        description: t("pricing_starter_desc"),
        features: [
          t("pricing_feature_customers"),
          t("pricing_feature_work_orders"),
          t("pricing_feature_basic_reports"),
          t("pricing_feature_email_support"),
        ],
        cta: t("pricing_start_trial"),
      },
      {
        name: t("pricing_professional"),
        price: "R$99",
        monthly: true,
        description: t("pricing_professional_desc"),
        features: [
          t("pricing_feature_customers"),
          t("pricing_feature_work_orders"),
          t("pricing_feature_products"),
          t("pricing_feature_financial"),
          t("pricing_feature_advanced_reports"),
          t("pricing_feature_priority_support"),
        ],
        cta: t("pricing_start_trial"),
        popular: true,
      },
      {
        name: t("pricing_enterprise"),
        price: t("pricing_contact"),
        description: t("pricing_enterprise_desc"),
        features: [
          t("pricing_feature_unlimited"),
          t("pricing_feature_integrations"),
          t("pricing_feature_customization"),
          t("pricing_feature_premium_support"),
        ],
        cta: t("pricing_contact_sales"),
      },
    ],
    annually: [
      {
        name: t("pricing_starter"),
        price: "R$39",
        monthly: true,
        description: t("pricing_starter_desc"),
        features: [
          t("pricing_feature_customers"),
          t("pricing_feature_work_orders"),
          t("pricing_feature_basic_reports"),
          t("pricing_feature_email_support"),
        ],
        cta: t("pricing_start_trial"),
      },
      {
        name: t("pricing_professional"),
        price: "R$79",
        monthly: true,
        description: t("pricing_professional_desc"),
        features: [
          t("pricing_feature_customers"),
          t("pricing_feature_work_orders"),
          t("pricing_feature_products"),
          t("pricing_feature_financial"),
          t("pricing_feature_advanced_reports"),
          t("pricing_feature_priority_support"),
        ],
        cta: t("pricing_start_trial"),
        popular: true,
      },
      {
        name: t("pricing_enterprise"),
        price: t("pricing_contact"),
        description: t("pricing_enterprise_desc"),
        features: [
          t("pricing_feature_unlimited"),
          t("pricing_feature_integrations"),
          t("pricing_feature_customization"),
          t("pricing_feature_premium_support"),
        ],
        cta: t("pricing_contact_sales"),
      },
    ],
  }
  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full  bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" style={{
        backgroundImage: `linear-gradient(to right, ${colors["sidebar-border"] || "#f0f0f0"} 1px, transparent 1px), linear-gradient(to bottom, ${colors["sidebar-border"] || "#f0f0f0"} 1px, transparent 1px)`
      }}></div>
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            {t("pricing_badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("pricing_title")}</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            {t("pricing_description")}
          </p>
        </motion.div>
        <div className="mx-auto max-w-5xl">
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="rounded-full p-1">
                <TabsTrigger value="monthly" className="rounded-full px-6">
                  {t("pricing_monthly")}
                </TabsTrigger>
                <TabsTrigger value="annually" className="rounded-full px-6">
                  {t("pricing_annually")}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="monthly">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {plans.monthly.map((plan, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                          {t("pricing_most_popular")}
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          {plan.monthly && <span className="text-muted-foreground ml-1">{t("pricing_per_month")}</span>}
                        </div>
                        <p className="text-muted-foreground mt-2">{plan.description}</p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-auto rounded-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                          variant={plan.popular ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="annually">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {plans.annually.map((plan, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                          {t("pricing_most_popular")}
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          {plan.monthly && <span className="text-muted-foreground ml-1">{t("pricing_per_month")}</span>}
                        </div>
                        <p className="text-muted-foreground mt-2">{plan.description}</p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-auto rounded-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                          variant={plan.popular ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
