import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

export function HowItWorksSection({ colors }: { colors: Record<string, string> }) {
  const { t } = useTranslation("landing")
  return (
    <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full  bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" style={{
        backgroundImage: `linear-gradient(to right, ${colors["sidebar-border"] || "#f0f0f0"} 1px, transparent 1px), linear-gradient(to bottom, ${colors["sidebar-border"] || "#f0f0f0"} 1px, transparent 1px)`
      }}></div>
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            {t("how_badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("how_title")}</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            {t("how_description")}
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {[
            {
              step: "01",
              title: t("how_step1"),
              description: t("how_step1_desc"),
            },
            {
              step: "02",
              title: t("how_step2"),
              description: t("how_step2_desc"),
            },
            {
              step: "03",
              title: t("how_step3"),
              description: t("how_step3_desc"),
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center space-y-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
                {step.step}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
