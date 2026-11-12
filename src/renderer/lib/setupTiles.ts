import type Rand from "rand-seed"
import {
  type DeckTile,
  type MapType,
  type Tile,
  getFreeTiles,
  getMap,
  initTileDb,
  mapGet,
} from "./game"
import { shuffle } from "./rand"

// From paper: https://iivq.net/scriptie/scriptie-bsc.pdf
const MAX_DEAL_ATTEMPTS = 40

type Slot = { id: string; x: number; y: number; z: number }

function positionsFromMap(map: MapType): Slot[] {
  const positions: Slot[] = []

  for (let z = 0; z < map.length; z++) {
    const level = map[z]
    if (!level) continue

    for (let y = 0; y < level.length; y++) {
      const row = level[y]
      if (!row) continue

      for (let x = 0; x < row.length; x++) {
        const id = mapGet(map, x, y, z)
        const prev = mapGet(map, x - 1, y, z)
        const above = mapGet(map, x, y - 1, z)
        const sameAsPrev = prev ? prev === id : false
        const sameAsAbove = above ? above === id : false

        if (id !== null && !sameAsPrev && !sameAsAbove) {
          positions.push({ id, x, y, z })
        }
      }
    }
  }

  return positions
}

function mapForPairCount(pairCount: number) {
  let limit = pairCount * 2
  let map = getMap(limit)
  let positions = positionsFromMap(map)

  while (positions.length % 2 === 1 && limit > 0) {
    limit -= 1
    map = getMap(limit)
    positions = positionsFromMap(map)
  }

  return { map, positions }
}

function deal(
  rng: Rand,
  map: MapType,
  positions: Slot[],
  deck: DeckTile[],
) {
  const tileDb = initTileDb({})

  for (const position of positions) {
    tileDb.set(position.id, {
      cardId: "bam1",
      material: "bone",
      id: position.id,
      x: position.x,
      y: position.y,
      z: position.z,
      deleted: false,
      selected: false,
    })
  }

  const pickOrder: Tile[] = []

  while (true) {
    const freeTiles = getFreeTiles(tileDb)
    if (freeTiles.length <= 1) break

    while (freeTiles.length > 1) {
      const idx1 = Math.floor(rng.next() * freeTiles.length)
      const tile1 = freeTiles[idx1]!
      freeTiles.splice(idx1, 1)

      const idx2 = Math.floor(rng.next() * freeTiles.length)
      const tile2 = freeTiles[idx2]!
      freeTiles.splice(idx2, 1)

      tileDb.del(tile1.id)
      tileDb.del(tile2.id)
      pickOrder.push(tile1, tile2)
    }
  }

  if (tileDb.size > 0) return null

  const pairs: [DeckTile, DeckTile][] = deck.map((deckTile) => [
    deckTile,
    deckTile,
  ])
  const shuffledPairs = shuffle(pairs, rng)

  for (let i = 0; i < pickOrder.length; i += 2) {
    const tile1 = pickOrder[pickOrder.length - 1 - i]!
    const tile2 = pickOrder[pickOrder.length - 2 - i]!
    const pair = shuffledPairs[i / 2]!
    const [deckTile1, deckTile2] = pair
    const id1 = mapGet(map, tile1.x, tile1.y, tile1.z)!
    const id2 = mapGet(map, tile2.x, tile2.y, tile2.z)!

    tileDb.set(id1, {
      id: id1,
      cardId: deckTile1.cardId,
      material: deckTile1.material,
      x: tile1.x,
      y: tile1.y,
      z: tile1.z,
      deleted: false,
      selected: false,
    })

    tileDb.set(id2, {
      id: id2,
      cardId: deckTile2.cardId,
      material: deckTile2.material,
      x: tile2.x,
      y: tile2.y,
      z: tile2.z,
      deleted: false,
      selected: false,
    })
  }

  return tileDb.byId
}

export function setupTiles({ rng, deck }: { rng: Rand; deck: DeckTile[] }) {
  let cards = deck

  while (cards.length > 0) {
    const { map, positions } = mapForPairCount(cards.length)
    const fitting = cards.slice(0, positions.length / 2)

    for (let attempt = 0; attempt < MAX_DEAL_ATTEMPTS; attempt++) {
      const dealt = deal(rng, map, positions, fitting)
      if (dealt) return dealt
    }

    cards = fitting.slice(0, -1)
  }

  return {}
}
