import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Zap, BarChart, Users, Shield, Layers, Star } from "lucide-react"

export function FeaturesSection() {
  const { t } = useTranslation("landing")
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }
  const features = [
    {
      title: t("feature_smart_automation"),
      description: t("feature_smart_automation_desc"),
      icon: <Zap className="size-5" />,
    },
    {
      title: t("feature_advanced_analytics"),
      description: t("feature_advanced_analytics_desc"),
      icon: <BarChart className="size-5" />,
    },
    {
      title: t("feature_team_collaboration"),
      description: t("feature_team_collaboration_desc"),
      icon: <Users className="size-5" />,
    },
    {
      title: t("feature_enterprise_security"),
      description: t("feature_enterprise_security_desc"),
      icon: <Shield className="size-5" />,
    },
    {
      title: t("feature_seamless_integration"),
      description: t("feature_seamless_integration_desc"),
      icon: <Layers className="size-5" />,
    },
    {
      title: t("feature_support"),
      description: t("feature_support_desc"),
      icon: <Star className="size-5" />,
    },
  ]
  return (
    <section id="features" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            {t("features_badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("features_title")}</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            {t("features_description")}
          </p>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
