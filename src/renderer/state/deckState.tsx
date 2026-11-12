import {
  type Deck,
  type DeckTile,
  type DeckTileIndexes,
  deckTileIndexes,
  getInitialPairs,
  getMaterialPoints,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { type ParentProps, batch, useContext } from "solid-js"
import { createContext } from "solid-js"
import { createPersistentDatabase } from "./persistentDatabase"

const DECK_STATE_NAMESPACE = "deck-state-v4"
export const DECK_CAPACITY = 163

export function deckWithinCapacity(deck: DeckTile[]) {
  const maxCards = Math.floor(DECK_CAPACITY / 2)
  if (deck.length <= maxCards) return deck

  return [...deck]
    .sort(
      (a, b) => getMaterialPoints(b.material) - getMaterialPoints(a.material),
    )
    .slice(0, maxCards)
}

export function createDeckState() {
  const db = new Database<DeckTile, DeckTileIndexes>(deckTileIndexes)

  createPersistentDatabase({
    namespace: DECK_STATE_NAMESPACE,
    db,
    init: () => {
      initializeDeckState(db)
    },
  })

  return db
}

export function initializeDeckState(deck: Deck) {
  batch(() => {
    deck.update({})
    const pairs = getInitialPairs()
    for (const [i, cards] of pairs.entries()) {
      const id = i.toString()
      deck.set(id, {
        id,
        cardId: cards[0].id,
        material: "bone",
      })
    }
  })
}

const DeckStateContext = createContext<Deck | undefined>()

export function DeckStateProvider(props: { deck: Deck } & ParentProps) {
  return (
    <DeckStateContext.Provider value={props.deck}>
      {props.children}
    </DeckStateContext.Provider>
  )
}

export function useDeckState() {
  const context = useContext(DeckStateContext)
  if (!context) throw new Error("can't find DeckStateContext")

  return context
}
