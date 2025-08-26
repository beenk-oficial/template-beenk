import { useTranslation } from "react-i18next"

function isColorDark(hex: string): boolean {
  if (!hex) return false;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export function LogosSection({ colors }: { colors: Record<string, string> }) {
  const { t } = useTranslation("landing")
  return (
    <section className="w-full py-12 border-y bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("trusted_by")}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={`/placeholder-logo.svg`}
                alt={`Company logo ${i}`}
                width={120}
                height={60}
                className={`h-8 w-auto opacity-80 transition-all hover:opacity-100 hover:grayscale-0${isColorDark(colors?.background) ? " invert" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
