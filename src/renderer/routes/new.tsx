import { LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import type { CardId, Material } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { initializeDeckState, useDeckState } from "@/state/deckState"
import { initialGameState, useGameState } from "@/state/gameState"
import { setMutable } from "@/state/persistantMutable"
import { TUTORIAL_SEED, initialRunState, useRunState } from "@/state/runState"
import { initializeTileState, useTileState } from "@/state/tileState"
import type { AccentHue } from "@/styles/colors"
import { useNavigate } from "@solidjs/router"
import { nanoid } from "nanoid"
import { batch, createMemo } from "solid-js"
import {
  arrowClass,
  backButtonClass,
  containerClass,
  contentClass,
  floatingClass,
  itemClass,
  itemContentClass,
  itemDescriptionClass,
  itemTitleClass,
  itemsClass,
  titleClass,
} from "./new.css"

export default function New() {
  const t = useTranslation()

  return (
    <div class={containerClass}>
      <div class={contentClass}>
        <div class={backButtonClass}>
          <LinkButton href="/" hue="dot">
            <ArrowLeft />
          </LinkButton>
        </div>
        <h1 class={titleClass}>{t.newRun.title()}</h1>
        <div class={itemsClass}>
          <Difficulty
            title={t.newRun.tutorial.title()}
            hue="black"
            cardId="elementk"
            material="quartz"
            i={1}
            seed={TUTORIAL_SEED}
            description={t.newRun.tutorial.description()}
          />
          <Difficulty
            title={t.newRun.gentle.title()}
            hue="bam"
            cardId="elementg"
            material="jade"
            i={1}
            seed={`E-${nanoid()}`}
            description={t.newRun.gentle.description()}
          />
          <Difficulty
            title={t.newRun.challenging.title()}
            hue="dot"
            cardId="elementb"
            material="topaz"
            i={2}
            seed={`M-${nanoid()}`}
            description={t.newRun.challenging.description()}
          />
          <Difficulty
            title={t.newRun.hardcore.title()}
            hue="crack"
            cardId="elementr"
            material="garnet"
            seed={`H-${nanoid()}`}
            i={3}
            description={t.newRun.hardcore.description()}
          />
        </div>
      </div>
    </div>
  )
}

function Difficulty(props: {
  hue: AccentHue
  cardId: CardId
  material: Material
  seed: string
  title: string
  description: string
  i: number
}) {
  const run = useRunState()
  const game = useGameState()
  const deck = useDeckState()
  const tiles = useTileState()
  const navigate = useNavigate()
  const roundId = createMemo(() => `${run.runId}-${run.round}`)

  function onNewRun(seed: string) {
    batch(() => {
      setMutable(run, initialRunState(seed))
      initializeDeckState(deck)
      initializeTileState(roundId(), deck.all, tiles)
      setMutable(game, initialGameState(roundId()))
    })

    captureEvent("start_game", {
      runId: run.runId,
      difficulty: run.difficulty,
    })
    navigate("/play")
  }

  return (
    <button
      type="button"
      class={itemClass({ hue: props.hue })}
      onClick={() => onNewRun(props.seed)}
    >
      <div class={floatingClass({ stagger: (props.i % 3) as any })}>
        <BasicTile cardId={props.cardId} material={props.material} />
      </div>
      <div class={itemContentClass}>
        <div class={itemTitleClass}>{props.title}</div>
        <div class={itemDescriptionClass}>{props.description}</div>
      </div>
      <ArrowRight class={arrowClass} />
    </button>
  )
}
