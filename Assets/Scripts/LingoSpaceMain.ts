/** Experience state, semantic validation, AI scan pipeline, and voice coaching. */
import {LingoSpaceMenuUI} from "./LingoSpaceMenuUI"
import {LingoSpaceBoardUI} from "./LingoSpaceBoardUI"
import {LingoSpaceCompletionUI} from "./LingoSpaceCompletionUI"
import {
  CategoryId,
  getReferenceCards,
  isLanguageId,
  LanguageId,
  LearningMode,
  ScanSituation,
  VocabularyCard,
} from "./LingoSpaceData"
import {LingoSpaceAudioController} from "./LingoSpaceAudioController"
import {LingoSpaceAIService} from "./LingoSpaceAIService"
import {LingoSpaceCameraService, LingoSpaceCapture} from "./LingoSpaceCameraService"
import {lingoCopy} from "./LingoSpaceLocalization"
import {LingoSpaceProgressStore, PersistedVocabularyCard} from "./LingoSpaceProgressStore"

type PronunciationCopy = {
  correct: string
  retry: string
  tip: string
  correctSpoken: string
  retrySpoken: string
  tryAgainSpoken: string
}

type SavedScanCard = {
  card: VocabularyCard
  promptLabel: string
  visualDescription: string
  texture: Texture | null
  state: "PENDING" | "GENERATING" | "READY" | "FAILED"
}

type ZoomTarget = {transform: Transform, basePosition: vec3}

@component
export class LingoSpaceMain extends BaseScriptComponent {
  @input @hint("Three-step setup UIKit module") menuUI!: LingoSpaceMenuUI
  @input @hint("Spatial organization UIKit module") boardUI!: LingoSpaceBoardUI
  @input @hint("Round completion UIKit module") completionUI!: LingoSpaceCompletionUI
  @input @hint("Show collider debug visuals") debugColliders: boolean = false
  @input @allowUndefined @hint("Optional background AudioTrack. Leave empty for silence; drag your own music here in the Inspector.") backgroundMusic?: AudioTrackAsset
  @input @hint("Background music volume from 0 (silent) to 1 (full volume). Recommended: 0.06.") backgroundMusicVolume: number = 0.06

  private nativeLanguage: LanguageId | null = null
  private targetLanguage: LanguageId | null = null
  private learningMode: LearningMode | null = null
  private cards: VocabularyCard[] = []
  private currentCard: VocabularyCard | null = null
  private currentTexture: Texture | null = null
  private cardIndex = 0
  private organized = 0
  private imageBatchIndex = 0
  private audioXp = 0
  private textXp = 0
  private practicedCardIds: string[] = []
  private readPhraseIds: string[] = []
  private scanInProgress = false
  private scanCards: VocabularyCard[] = []
  private scanCardIndex = 0
  private scanBatchIndex = 0
  private scanSituation: ScanSituation | null = null
  private scanPhraseIndex = 0
  private savedScanCards: SavedScanCard[] = []
  private scanLibraries: {[languagePair: string]: SavedScanCard[]} = {}
  private hydratedScanLibraries: {[languagePair: string]: boolean} = {}
  private scanCardSerial = 0
  private artworkQueue: Promise<void> = Promise.resolve()
  private usingScannedLibrary = false
  private roundTotal = 6
  private counts: Record<CategoryId, number> = {HOME: 0, FOOD: 0, WORK: 0, TRAVEL: 0, PEOPLE: 0, OUTSIDE: 0}
  private audio!: LingoSpaceAudioController
  private ai!: LingoSpaceAIService
  private progress!: LingoSpaceProgressStore
  private camera = new LingoSpaceCameraService()
  private nextEvent: any
  private unlockDropEvent: any
  private voiceFinalizeEvent: any
  private voiceCleanupEvent: any
  private dropLocked = false
  private voicePracticeActive = false
  private zoomTargets: ZoomTarget[] = []
  private distanceOffset = 0

  onAwake(): void {
    this.progress = new LingoSpaceProgressStore()
    this.audio = new LingoSpaceAudioController(this.sceneObject)
    this.ai = new LingoSpaceAIService(this.sceneObject)
    this.nextEvent = this.createEvent("DelayedCallbackEvent")
    this.nextEvent.bind(() => this.advanceAfterSave())
    this.unlockDropEvent = this.createEvent("DelayedCallbackEvent")
    this.unlockDropEvent.bind(() => this.dropLocked = false)
    this.voiceFinalizeEvent = this.createEvent("DelayedCallbackEvent")
    this.voiceFinalizeEvent.bind(() => this.ai.forceFinalizeListening())
    this.voiceCleanupEvent = this.createEvent("DelayedCallbackEvent")
    this.voiceCleanupEvent.bind(() => this.ai.cleanupListening())
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart(): void {
    if (!this.menuUI || !this.boardUI || !this.completionUI) {
      console.error("LINGO SPACE: UI module references are not wired")
      return
    }
    this.audio.initializeForSpecs(this.backgroundMusic, this.backgroundMusicVolume)
    this.ai.initialize()
    const profile = this.progress.getProfile()
    this.nativeLanguage = profile.nativeLanguage
    this.targetLanguage = profile.targetLanguage
    this.audioXp = profile.audioXp
    this.textXp = profile.textXp
    this.menuUI.setUserName(profile.userName || "Learner")
    this.menuUI.restoreSelection(this.nativeLanguage, this.targetLanguage)
    this.resolveUserName()
    this.menuUI.onNativeLanguageSelected.add((value) => {
      if (isLanguageId(value)) {
        this.nativeLanguage = value
        this.targetLanguage = null
        this.learningMode = null
        this.progress.setLanguages(this.nativeLanguage, null)
      }
      this.audio.playClick()
    })
    this.menuUI.onTargetLanguageSelected.add((value) => {
      if (isLanguageId(value)) {
        this.targetLanguage = value
        this.progress.setLanguages(this.nativeLanguage, this.targetLanguage)
        this.activateSavedLibrary()
      }
      this.audio.playClick()
    })
    this.menuUI.onModeSelected.add((value) => {
      if (value === "IMAGE" || value === "SCAN") this.learningMode = value
      this.audio.playClick()
    })
    this.menuUI.onStart.add(() => {
      this.imageBatchIndex = 0
      this.startRound()
    })
    this.boardUI.onCardDropped.add((category) => this.handleDrop(category as CategoryId))
    this.boardUI.onScanRequested.add(() => this.scanObject())
    this.boardUI.onListenRequested.add(() => this.listenToCurrentWord())
    this.boardUI.onVoiceHoldStart.add(() => this.startVoicePractice())
    this.boardUI.onVoiceHoldEnd.add(() => this.finishVoicePractice())
    this.boardUI.onScanCardSelected.add((index) => this.selectScanCard(index))
    this.boardUI.onScanPhraseSelected.add((index) => this.selectScanPhrase(index))
    this.boardUI.onPracticeSavedCards.add(() => this.startSavedCardsPractice())
    this.boardUI.onZoomRequested.add((direction) => this.applyDistanceZoom(direction))
    this.completionUI.onNextRound.add(() => {
      if (this.usingScannedLibrary) {
        this.startSavedCardsPractice()
        return
      }
      if (this.learningMode === "IMAGE" && !this.usingScannedLibrary) this.imageBatchIndex += 1
      this.startRound()
    })
    this.completionUI.onChangeLanguage.add(() => this.changeSetup())
    global.deviceInfoSystem.onInternetStatusChanged.add((args) => this.boardUI.setInternetAvailable(args.isInternetAvailable))
    this.boardUI.setInternetAvailable(global.deviceInfoSystem.isInternetAvailable())
    this.boardUI.hide()
    this.completionUI.hide()
    this.menuUI.show()
    this.captureZoomTargets()
    this.setColliderDebugAll(this.sceneObject, this.debugColliders)
    console.log("LINGO SPACE ready: native → target → mode")
  }

  private startRound(): void {
    if (!this.nativeLanguage || !this.targetLanguage || !this.learningMode) return
    this.activateSavedLibrary()
    this.audio.playClick()
    this.cards = this.learningMode === "IMAGE" ? getReferenceCards(this.targetLanguage, this.nativeLanguage, this.imageBatchIndex) : []
    this.usingScannedLibrary = false
    this.roundTotal = this.cards.length > 0 ? this.cards.length : 6
    this.cardIndex = 0
    this.organized = 0
    this.dropLocked = false
    this.scanInProgress = false
    this.currentCard = null
    this.currentTexture = null
    this.practicedCardIds = []
    this.readPhraseIds = []
    this.scanCards = []
    this.scanCardIndex = 0
    this.scanBatchIndex = 0
    this.scanSituation = null
    this.scanPhraseIndex = 0
    this.counts = {HOME: 0, FOOD: 0, WORK: 0, TRAVEL: 0, PEOPLE: 0, OUTSIDE: 0}
    this.progress.beginSession(this.nativeLanguage, this.targetLanguage, this.learningMode)
    this.menuUI.hide()
    this.completionUI.hide()
    this.boardUI.startRound(this.nativeLanguage, this.targetLanguage, this.learningMode)
    this.boardUI.setXp(this.audioXp, this.textXp)
    if (this.learningMode === "SCAN") this.prepareScanner()
    else this.showReferenceCard()
    console.log(`LINGO SPACE round started: native=${this.nativeLanguage}, target=${this.targetLanguage}, mode=${this.learningMode}`)
  }

  private prepareScanner(): void {
    this.currentCard = null
    this.currentTexture = null
    this.scanCards = []
    this.scanCardIndex = 0
    this.scanSituation = null
    this.scanPhraseIndex = 0
    this.scanInProgress = false
    this.boardUI.clearScanCandidates()
    this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "scanPrompt"))
    this.camera.ensureStarted()
      .then((texture) => this.boardUI.showScanner(texture))
      .catch((error) => {
        console.error(`LINGO SPACE camera error: ${error}`)
        this.boardUI.showScanFailure(lingoCopy(this.nativeLanguage, "cameraUnavailable"))
      })
  }

  private scanObject(): void {
    if (this.learningMode !== "SCAN" || this.scanInProgress) return
    if (!global.deviceInfoSystem.isInternetAvailable()) {
      this.boardUI.showScanFailure(lingoCopy(this.nativeLanguage, "internetScan"))
      return
    }
    if (!this.nativeLanguage || !this.targetLanguage) return
    this.scanInProgress = true
    this.audio.playClick()
    this.boardUI.showScanning()
    this.camera.capture()
      .then((capture) => this.identifyCapture(capture))
      .catch((error) => {
        this.scanInProgress = false
        console.error(`LINGO SPACE scan error: ${error}`)
        this.boardUI.showScanFailure(lingoCopy(this.nativeLanguage, "scanFailed"))
      })
  }

  private identifyCapture(capture: LingoSpaceCapture): Promise<void> {
    if (!this.nativeLanguage || !this.targetLanguage) return Promise.resolve()
    return this.ai.identifySituation(capture.base64Jpeg, this.nativeLanguage, this.targetLanguage)
      .then((result) => {
        this.scanInProgress = false
        this.currentTexture = capture.texture
        this.scanBatchIndex += 1
        const scanTimestamp = new Date().getTime()
        this.scanSituation = result
        this.scanPhraseIndex = 0
        this.scanCards = result.objects.map((resultCard, index) => ({
          id: `scan-${this.targetLanguage}-${scanTimestamp}-${++this.scanCardSerial}-${index}-${resultCard.objectName}`,
          imageKey: "scan",
          word: resultCard.word,
          translation: resultCard.translation,
          contexts: resultCard.contexts,
          source: "SCAN",
        }))
        const newEntries = this.scanCards.map((card, index): SavedScanCard => ({
          card,
          promptLabel: result.objects[index].objectName,
          visualDescription: result.objects[index].visualDescription,
          texture: null,
          state: "PENDING",
        }))
        for (let i = 0; i < newEntries.length; i++) {
          const entry = newEntries[i]
          this.savedScanCards.push(entry)
          this.progress.recordCard(entry.card, this.nativeLanguage!, this.targetLanguage!, {
            promptLabel: entry.promptLabel,
            visualDescription: entry.visualDescription,
            practice: "SCAN",
          })
        }
        this.boardUI.showSituation(result, capture.texture, this.savedScanCards.length, this.readyScanCardCount())
        this.selectScanCard(0)
        this.selectScanPhrase(0, false)
        this.queueArtworkGeneration(newEntries)
        console.log(`LINGO SPACE situational scan: ${this.scanCards.length} objects saved and ${result.phrases.length} phrases created`)
      })
  }

  private selectScanCard(index: number): void {
    if (this.learningMode !== "SCAN" || !this.scanSituation || this.scanCards.length === 0) return
    const selected = Math.max(0, Math.min(index, this.scanCards.length - 1))
    this.scanCardIndex = selected
    this.boardUI.selectScanObject(selected)
    console.log(`LINGO SPACE selected detected object ${selected + 1}/${this.scanCards.length}: ${this.scanCards[selected].word}`)
  }

  private selectScanPhrase(index: number, awardXp: boolean = true): void {
    if (this.learningMode !== "SCAN" || !this.scanSituation || this.scanSituation.phrases.length === 0) return
    this.scanPhraseIndex = Math.max(0, Math.min(index, this.scanSituation.phrases.length - 1))
    this.boardUI.selectScanPhrase(this.scanPhraseIndex)
    const phraseId = `${this.scanBatchIndex}:${this.scanPhraseIndex}`
    if (awardXp && this.readPhraseIds.indexOf(phraseId) < 0) {
      this.readPhraseIds.push(phraseId)
      this.textXp += 3
      this.progress.recordXp(this.audioXp, this.textXp)
      this.boardUI.setXp(this.audioXp, this.textXp, `+3 ${lingoCopy(this.nativeLanguage, "textXp")}`)
    }
    this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "listenPhrase"))
  }

  private startSavedCardsPractice(): void {
    if (!this.nativeLanguage || !this.targetLanguage) return
    this.activateSavedLibrary()
    const pendingEntries = this.savedScanCards.filter((entry) => entry.state === "PENDING" || entry.state === "FAILED")
    if (pendingEntries.length > 0 && global.deviceInfoSystem.isInternetAvailable()) this.queueArtworkGeneration(pendingEntries)
    const readyEntries = this.savedScanCards.filter((entry) => entry.state === "READY" && !!entry.texture)
    const persistedCards = this.progress.getCards(this.nativeLanguage, this.targetLanguage)
    const referenceCards = persistedCards.filter((entry) => entry.source === "REFERENCE").map((entry) => this.asVocabularyCard(entry))
    const availableCards: VocabularyCard[] = []
    const seen: string[] = []
    for (let i = 0; i < referenceCards.length; i++) {
      availableCards.push(referenceCards[i])
      seen.push(referenceCards[i].id)
    }
    for (let i = 0; i < readyEntries.length; i++) {
      if (seen.indexOf(readyEntries[i].card.id) >= 0) continue
      availableCards.push(readyEntries[i].card)
      seen.push(readyEntries[i].card.id)
    }
    if (availableCards.length === 0) {
      this.boardUI.showVoiceStatus(`${lingoCopy(this.nativeLanguage, "savedCards")}. ${lingoCopy(this.nativeLanguage, "illustrationsReady")}…`)
      return
    }
    this.audio.playClick()
    this.learningMode = "IMAGE"
    this.usingScannedLibrary = true
    this.cards = availableCards
    this.roundTotal = this.cards.length
    this.cardIndex = 0
    this.organized = 0
    this.dropLocked = false
    this.currentCard = null
    this.currentTexture = null
    this.practicedCardIds = []
    this.counts = {HOME: 0, FOOD: 0, WORK: 0, TRAVEL: 0, PEOPLE: 0, OUTSIDE: 0}
    this.progress.beginSession(this.nativeLanguage, this.targetLanguage, "IMAGE")
    this.menuUI.hide()
    this.completionUI.hide()
    this.boardUI.startRound(this.nativeLanguage, this.targetLanguage, "IMAGE")
    this.boardUI.setProgress(0, this.roundTotal)
    this.boardUI.setXp(this.audioXp, this.textXp)
    this.showReferenceCard()
    console.log(`LINGO SPACE practicing ${this.roundTotal} saved situational cards`)
  }

  private queueArtworkGeneration(entries: SavedScanCard[]): void {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      if (entry.state === "GENERATING" || entry.state === "READY") continue
      entry.state = "GENERATING"
      this.artworkQueue = this.artworkQueue
        .then(() => this.ai.generateCardArtwork(entry.promptLabel, entry.visualDescription))
        .then((texture) => {
          entry.texture = texture
          entry.state = "READY"
          this.boardUI.setScanArtworkProgress(this.savedScanCards.length, this.readyScanCardCount())
          console.log(`LINGO SPACE kawaii card ready: ${entry.promptLabel}`)
        })
        .catch((error) => {
          entry.state = "FAILED"
          console.error(`LINGO SPACE card artwork failed for ${entry.promptLabel}: ${error}`)
          this.boardUI.setScanArtworkProgress(this.savedScanCards.length, this.readyScanCardCount())
        })
    }
  }

  private readyScanCardCount(): number {
    return this.savedScanCards.filter((entry) => entry.state === "READY" && !!entry.texture).length
  }

  private currentPracticeCard(): VocabularyCard | null {
    if (this.learningMode === "IMAGE") return this.currentCard
    if (!this.scanSituation || this.scanSituation.phrases.length === 0) return null
    const phrase = this.scanSituation.phrases[this.scanPhraseIndex]
    if (!phrase) return null
    return {
      id: `situation-${this.scanBatchIndex}-phrase-${this.scanPhraseIndex}`,
      imageKey: "scan",
      word: phrase.target,
      translation: phrase.translation,
      contexts: ["PEOPLE"],
      source: "SCAN",
    }
  }

  private handleDrop(category: CategoryId): void {
    if (this.learningMode !== "IMAGE" || this.dropLocked || !this.currentCard) return
    const card = this.currentCard
    this.dropLocked = true
    if (card.contexts.indexOf(category) >= 0) {
      this.counts[category] += 1
      this.organized += 1
      this.textXp += 5
      this.progress.recordCard(card, this.nativeLanguage!, this.targetLanguage!, {practice: "TEXT"})
      this.progress.recordXp(this.audioXp, this.textXp)
      this.boardUI.acceptDrop(category, this.counts[category], card.word)
      this.boardUI.setProgress(this.organized, this.roundTotal)
      this.boardUI.setXp(this.audioXp, this.textXp, "+5 TEXT XP")
      this.audio.playSaved()
      console.log(`LINGO SPACE saved ${card.word} to ${category}`)
      this.nextEvent.reset(0.85)
    } else {
      this.boardUI.rejectDrop()
      this.audio.playSoftReturn()
      console.log(`LINGO SPACE soft return ${card.word} from ${category}`)
      this.unlockDropEvent.reset(0.25)
    }
  }

  private advanceAfterSave(): void {
    if (this.organized >= this.roundTotal) {
      this.currentCard = null
      this.boardUI.hide()
      this.completionUI.showSummary(this.counts, this.audioXp, this.textXp, this.nativeLanguage!)
      this.progress.completeSession()
      console.log("LINGO SPACE round complete")
      return
    }
    this.dropLocked = false
    this.cardIndex += 1
    this.showReferenceCard()
  }

  private showReferenceCard(): void {
    const card = this.cards[this.cardIndex]
    if (!card) return
    this.currentCard = card
    const saved = this.savedScanCards.find((entry) => entry.card.id === card.id)
    this.currentTexture = saved?.texture || null
    this.boardUI.showCard(card.imageKey, card.word, card.translation, this.currentTexture || undefined)
    this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "listenPhrase"))
  }

  private listenToCurrentWord(): void {
    const card = this.currentPracticeCard()
    if (!card || !this.targetLanguage) {
      this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "nothingReady"))
      return
    }
    if (!global.deviceInfoSystem.isInternetAvailable()) {
      this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "voiceNeedsInternet"))
      return
    }
    this.audio.playClick()
    this.boardUI.showVoiceStatus(`${lingoCopy(this.nativeLanguage, "listening")}: ${card.word}`)
    const speech = this.learningMode === "SCAN" && this.scanSituation
      ? this.ai.speakSituationGuide(
        this.scanSituation.objects[this.scanPhraseIndex]?.word || card.word,
        this.scanSituation.phrases[this.scanPhraseIndex]?.target || card.word,
        this.scanSituation.phrases[this.scanPhraseIndex]?.usageTip || "",
        this.targetLanguage,
        this.nativeLanguage!,
      )
      : this.ai.speak(card.word, `Pronounce this ${this.targetLanguage} expression clearly once, at a natural beginner-friendly pace.`)
    speech
      .then(() => this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "listenThenRepeat")))
      .catch((error) => {
        console.error(`LINGO SPACE TTS error: ${error}`)
        this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "voiceFailed"))
      })
  }

  private startVoicePractice(): void {
    const card = this.currentPracticeCard()
    if (!card) {
      this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "nothingReady"))
      return
    }
    if (!global.deviceInfoSystem.isInternetAvailable()) {
      this.boardUI.showVoiceStatus("ASR error: NoInternet")
      return
    }
    if (this.voicePracticeActive) return
    print("[LINGO ASR] talk pressed")
    if (this.learningMode === "SCAN") this.camera.invalidateForVoice()
    this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "releaseToStop"))
    this.voicePracticeActive = this.ai.startListening(
      (partial) => this.boardUI.showVoiceStatus(`${lingoCopy(this.nativeLanguage, "listening")}… ${partial}`),
      (error) => {
        this.voicePracticeActive = false
        this.boardUI.showVoiceStatus(error)
      },
    )
  }

  private finishVoicePractice(): void {
    const practiceCard = this.currentPracticeCard()
    if (!this.voicePracticeActive || !practiceCard || !this.nativeLanguage || !this.targetLanguage) return
    this.voicePracticeActive = false
    const card = practiceCard
    this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "finishing"))
    this.voiceFinalizeEvent.reset(3.0)
    this.ai.finishListening()
      .then((transcript) => {
        this.voiceFinalizeEvent.cancel()
        if (this.ai.needsForcedCleanup()) this.voiceCleanupEvent.reset(0.05)
        const heard = transcript.trim()
        if (!heard) {
          this.boardUI.showVoiceStatus(lingoCopy(this.nativeLanguage, "nothingHeard"))
          return
        }
        this.boardUI.showVoiceStatus(`${lingoCopy(this.nativeLanguage, "listening")}: ${heard} • ${lingoCopy(this.nativeLanguage, "evaluating")}`)
        return this.ai.coachPronunciation(heard, card, this.nativeLanguage!, this.targetLanguage!)
          .then((assessment) => {
            const copy = this.pronunciationCopy(this.nativeLanguage!)
            const message = assessment.correct
              ? `✓ ${copy.correct}`
              : `↻ ${copy.retry}\n${copy.tip} · ${assessment.feedback}`
            if (assessment.correct && this.practicedCardIds.indexOf(card.id) < 0) {
              this.audioXp += 10
              this.practicedCardIds.push(card.id)
              this.progress.recordCard(card, this.nativeLanguage!, this.targetLanguage!, {practice: "AUDIO"})
              this.progress.recordXp(this.audioXp, this.textXp)
              this.boardUI.setXp(this.audioXp, this.textXp, `+10 ${lingoCopy(this.nativeLanguage, "audioXp")}`)
            }
            this.boardUI.showPronunciationResult(assessment.correct, message)
            const spokenFeedback = assessment.correct
              ? copy.correctSpoken
              : `${copy.retrySpoken} ${assessment.feedback} ${copy.tryAgainSpoken}`
            return this.ai.speak(
              spokenFeedback,
              `Speak only the provided ${this.nativeLanguage} coaching clearly and encouragingly. Do not add, repeat, or translate any words.`,
            )
              .catch((error) => console.error(`LINGO SPACE pronunciation TTS error: ${error}`))
          })
      })
      .catch((error) => {
        this.voiceFinalizeEvent.cancel()
        console.error(`LINGO SPACE voice coach error: ${error}`)
        this.boardUI.showVoiceStatus(String(error))
      })
  }

  private changeSetup(): void {
    this.audio.playClick()
    this.progress.completeSession()
    this.imageBatchIndex = 0
    this.usingScannedLibrary = false
    this.scanSituation = null
    this.completionUI.hide()
    this.boardUI.hide()
    this.menuUI.resetFlow()
    this.menuUI.show()
  }

  private activateSavedLibrary(): void {
    if (!this.nativeLanguage || !this.targetLanguage) return
    const key = `${this.nativeLanguage}->${this.targetLanguage}`
    if (!this.scanLibraries[key]) this.scanLibraries[key] = []
    this.savedScanCards = this.scanLibraries[key]
    if (this.hydratedScanLibraries[key]) return
    const persisted = this.progress.getCards(this.nativeLanguage, this.targetLanguage)
    for (let i = 0; i < persisted.length; i++) {
      const entry = persisted[i]
      if (entry.source !== "SCAN" || this.savedScanCards.some((saved) => saved.card.id === entry.id)) continue
      this.savedScanCards.push({
        card: this.asVocabularyCard(entry),
        promptLabel: entry.promptLabel || entry.translation || entry.word,
        visualDescription: entry.visualDescription || `A clearly visible ${entry.promptLabel || entry.translation || entry.word}.`,
        texture: null,
        state: "PENDING",
      })
    }
    this.hydratedScanLibraries[key] = true
  }

  private asVocabularyCard(entry: PersistedVocabularyCard): VocabularyCard {
    return {
      id: entry.id,
      imageKey: entry.imageKey,
      word: entry.word,
      translation: entry.translation,
      contexts: entry.contexts.slice(),
      source: entry.source,
    }
  }

  private resolveUserName(): void {
    try {
      global.userContextSystem.requestDisplayName((value) => {
        const userName = String(value || "").trim()
        if (!userName) return
        this.progress.setUserName(userName)
        this.menuUI.setUserName(userName)
      })
    } catch (error) {
      console.warn(`LINGO SPACE display name unavailable: ${error}`)
    }
  }

  private captureZoomTargets(): void {
    this.zoomTargets = []
    for (let i = 0; i < this.sceneObject.getChildrenCount(); i++) {
      const transform = this.sceneObject.getChild(i).getTransform()
      const value = transform.getLocalPosition()
      this.zoomTargets.push({transform, basePosition: new vec3(value.x, value.y, value.z)})
    }
  }

  private applyDistanceZoom(direction: number): void {
    this.distanceOffset = Math.max(-22, Math.min(22, this.distanceOffset + (direction > 0 ? 7 : -7)))
    for (let i = 0; i < this.zoomTargets.length; i++) {
      const target = this.zoomTargets[i]
      const base = target.basePosition
      target.transform.setLocalPosition(new vec3(base.x, base.y, base.z + this.distanceOffset))
    }
    this.audio.playClick()
    print(`LINGO SPACE view distance adjusted: ${this.distanceOffset} cm`)
  }

  private pronunciationCopy(language: LanguageId): PronunciationCopy {
    switch (language) {
      case "Spanish": return {
        correct: "CORRECTO · SE ENTENDIÓ",
        retry: "INCORRECTO · VUELVE A PROBAR",
        tip: "CONSEJO",
        correctSpoken: "Correcto. Se entendió.",
        retrySpoken: "Incorrecto.",
        tryAgainSpoken: "Escucha el modelo y vuelve a probar.",
      }
      case "English": return {
        correct: "CORRECT · UNDERSTOOD",
        retry: "INCORRECT · TRY AGAIN",
        tip: "TIP",
        correctSpoken: "Correct. Understood.",
        retrySpoken: "Incorrect.",
        tryAgainSpoken: "Listen to the model and try again.",
      }
      case "German": return {
        correct: "RICHTIG · VERSTANDEN",
        retry: "NICHT RICHTIG · NOCH EINMAL",
        tip: "TIPP",
        correctSpoken: "Richtig. Verstanden.",
        retrySpoken: "Nicht richtig.",
        tryAgainSpoken: "Hör dir das Vorbild an und versuch es noch einmal.",
      }
      case "French": return {
        correct: "CORRECT · COMPRIS",
        retry: "INCORRECT · RÉESSAIE",
        tip: "CONSEIL",
        correctSpoken: "Correct. Compris.",
        retrySpoken: "Incorrect.",
        tryAgainSpoken: "Écoute le modèle et réessaie.",
      }
      case "Italian": return {
        correct: "CORRETTO · CAPITO",
        retry: "NON CORRETTO · RIPROVA",
        tip: "SUGGERIMENTO",
        correctSpoken: "Corretto. Capito.",
        retrySpoken: "Non corretto.",
        tryAgainSpoken: "Ascolta il modello e riprova.",
      }
      case "Japanese": return {
        correct: "正解 · 伝わりました",
        retry: "不正解 · もう一度",
        tip: "ヒント",
        correctSpoken: "正解です。伝わりました。",
        retrySpoken: "不正解です。",
        tryAgainSpoken: "お手本を聞いて、もう一度試してください。",
      }
    }
  }

  private setColliderDebugAll(root: SceneObject, enabled: boolean): void {
    const collider = root.getComponent("Physics.ColliderComponent") as ColliderComponent | null
    if (collider) collider.debugDrawEnabled = enabled
    for (let i = 0; i < root.getChildrenCount(); i++) this.setColliderDebugAll(root.getChild(i), enabled)
  }
}
