export const LOCALES = ["en", "es", "zh"] as const
export type Locale = (typeof LOCALES)[number]

export function resolveLocale(language: string | null | undefined): Locale {
  const code = language?.toLowerCase().split("-")[0]
  if (code === "zh" || code === "es" || code === "en") return code
  return "en"
}
