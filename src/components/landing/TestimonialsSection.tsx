import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"

export function TestimonialsSection() {
  const { t } = useTranslation("landing")
  const testimonials = [
    {
      quote: t("testimonial_1_quote"),
      author: t("testimonial_1_author"),
      role: t("testimonial_1_role"),
      rating: 5,
    },
    {
      quote: t("testimonial_2_quote"),
      author: t("testimonial_2_author"),
      role: t("testimonial_2_role"),
      rating: 5,
    },
    {
      quote: t("testimonial_3_quote"),
      author: t("testimonial_3_author"),
      role: t("testimonial_3_role"),
      rating: 5,
    },
    {
      quote: t("testimonial_4_quote"),
      author: t("testimonial_4_author"),
      role: t("testimonial_4_role"),
      rating: 5,
    },
    {
      quote: t("testimonial_5_quote"),
      author: t("testimonial_5_author"),
      role: t("testimonial_5_role"),
      rating: 5,
    },
    {
      quote: t("testimonial_6_quote"),
      author: t("testimonial_6_author"),
      role: t("testimonial_6_role"),
      rating: 5,
    },
  ]
  return (
    <section id="testimonials" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            {t("testimonials_badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("testimonials_title")}</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            {t("testimonials_description")}
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, j) => (
                        <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                      ))}
                  </div>
                  <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}