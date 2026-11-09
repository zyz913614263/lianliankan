import { expect, it } from "vitest"
import type { Dictionary } from "./en"
import { es } from "./es"
import { zh } from "./zh"

function coversEnglish(dict: Dictionary) {
  return dict.common.play.length > 0 && dict.settings.language.length > 0
}

it("covers the english copy", () => {
  expect(coversEnglish(es)).toBe(true)
  expect(coversEnglish(zh)).toBe(true)
})
