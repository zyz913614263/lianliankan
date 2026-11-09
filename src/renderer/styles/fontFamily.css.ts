import braveGates from "@/assets/BraveGates.otf"
import { globalFontFace } from "@vanilla-extract/css"

const cjk =
  '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif'
export const primary = `"Brave Gates", ${cjk}`
export const secondary = `"Nunito Variable", ${cjk}`

globalFontFace(primary, {
  src: `url(${braveGates})`,
})
