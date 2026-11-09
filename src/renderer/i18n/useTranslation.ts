import { useGlobalState } from "@/state/globalState"
import * as i18n from "@solid-primitives/i18n"
import { createMemo } from "solid-js"
import { en } from "./en"
import { es } from "./es"
import { resolveLocale } from "./locale"
import { zh } from "./zh"

const DICTIONARIES = { en, es, zh } as const
export type { Locale } from "./locale"
export type Translator = i18n.ChainedTranslator<i18n.Flatten<typeof en>>

export function useTranslation() {
  const global = useGlobalState()
  const flatDict = createMemo(() => {
    const dict = DICTIONARIES[resolveLocale(global.locale)]
    return i18n.flatten(dict)
  })

  const t = i18n.translator(flatDict, i18n.resolveTemplate)
  return i18n.proxyTranslator(t)
}
