import type { DeckTile } from "@/lib/game"
import { setupTiles } from "@/lib/setupTiles"
import Rand from "rand-seed"
import { expect, it } from "vitest"
import { deckWithinCapacity } from "./deckState"

function card(id: string, material: DeckTile["material"]): DeckTile {
  return { id, cardId: "bam1", material }
}

it("keeps the highest quality cards when the deck is over capacity", () => {
  const deck = [
    ...Array.from({ length: 80 }, (_, index) => card(`bone-${index}`, "bone")),
    card("jade", "jade"),
    card("ruby", "ruby"),
    card("emerald", "emerald"),
  ]

  const selected = deckWithinCapacity(deck)

  expect(selected).toHaveLength(81)
  expect(selected.slice(0, 3).map((tile) => tile.id)).toEqual([
    "emerald",
    "ruby",
    "jade",
  ])
  expect(selected.filter((tile) => tile.material === "bone")).toHaveLength(78)
})

it("deals an even board when the deck is larger than the map", () => {
  const deck = Array.from({ length: 82 }, (_, index) =>
    card(String(index), index === 0 ? "emerald" : "bone"),
  )

  const tiles = setupTiles({ rng: new Rand("over-capacity"), deck })
  const placed = Object.values(tiles)

  expect(placed.length % 2).toBe(0)
  expect(placed.length).toBeGreaterThan(0)
  expect(placed.length).toBeLessThanOrEqual(160)
  expect(placed.some((tile) => tile.material === "emerald")).toBe(true)
})
