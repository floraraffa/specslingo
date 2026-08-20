/** Dedicated situational scan UI. It intentionally contains no category targets or draggable cards. */
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexAlignSelf, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {LanguageId, ScanSituation} from "./LingoSpaceData"
import {languageName, lingoCopy} from "./LingoSpaceLocalization"
import {LINGO_COLORS, LINGO_FONT, styleLingoButton} from "./LingoSpaceTheme"

type TextRole = "Zoom" | "Headline1" | "Headline2" | "Subheadline" | "Body" | "Caption"
type MarkerView = {root: SceneObject, button: Button}
type PhraseChip = {root: SceneObject, item: FlexItem, button: Button}

const IMAGE_MATERIAL = requireAsset("../Materials/ImageMaterial.mat") as Material
const CAMERA_ICON = requireAsset("../Icons/photo_camera.png") as Texture
const MIC_ICON = requireAsset("../Icons/mic.png") as Texture
const VOLUME_ICON = requireAsset("../Icons/volume_up.png") as Texture
const CLOUDY_TEXTURE = requireAsset("../LingoDesign/cloud.png") as Texture
const SCAN_BACKGROUND_TEXTURE = requireAsset("../ScreenDesign/background.png") as Texture
const CLOUD_MESSAGE_TEXTURE = requireAsset("../BoardDesign/cloud-messages-b.png") as Texture

const TYPE_SCALE: Record<TextRole, {size: number, weight: number}> = {
  Zoom: {size: 62, weight: 800},
  Headline1: {size: 54, weight: 800},
  Headline2: {size: 48, weight: 800},
  Subheadline: {size: 41, weight: 800},
  Body: {size: 39, weight: 700},
  Caption: {size: 38, weight: 700},
}

export class LingoSpaceScanUI {
  private root: SceneObject
  private languageText!: Text
  private situationText!: Text
  private summaryText!: Text
  private objectText!: Text
  private phraseIntentText!: Text
  private phraseTargetText!: Text
  private phraseTranslationText!: Text
  private phraseHintText!: Text
  private savedText!: Text
  private xpText!: Text
  private statusText!: Text
  private internetText!: Text
  private scanActionContent!: Text
  private listenActionContent!: Text
  private talkActionContent!: Text
  private practiceActionContent!: Text
  private previewImage!: Image
  private previewMaterial!: Material
  private previewRoot!: SceneObject
  private markerHost!: SceneObject
  private phraseChipRoot!: SceneObject
  private phraseChipFlex!: FlexLayout
  private markers: MarkerView[] = []
  private phraseChips: PhraseChip[] = []
  private situation: ScanSituation | null = null
  private selectedObject = 0
  private selectedPhrase = 0
  private nativeLanguage: LanguageId = "English"
  private targetLanguage: LanguageId = "Spanish"

  private _onScanRequested = new Event<void>()
  private _onListenRequested = new Event<void>()
  private _onVoiceHoldStart = new Event<void>()
  private _onVoiceHoldEnd = new Event<void>()
  private _onObjectSelected = new Event<number>()
  private _onPhraseSelected = new Event<number>()
  private _onPracticeSaved = new Event<void>()
  private _onZoomRequested = new Event<number>()

  get onScanRequested(): PublicApi<void> { return this._onScanRequested.publicApi() }
  get onListenRequested(): PublicApi<void> { return this._onListenRequested.publicApi() }
  get onVoiceHoldStart(): PublicApi<void> { return this._onVoiceHoldStart.publicApi() }
  get onVoiceHoldEnd(): PublicApi<void> { return this._onVoiceHoldEnd.publicApi() }
  get onObjectSelected(): PublicApi<number> { return this._onObjectSelected.publicApi() }
  get onPhraseSelected(): PublicApi<number> { return this._onPhraseSelected.publicApi() }
  get onPracticeSaved(): PublicApi<void> { return this._onPracticeSaved.publicApi() }
  get onZoomRequested(): PublicApi<number> { return this._onZoomRequested.publicApi() }

  constructor(owner: SceneObject) {
    this.root = this.makeObject(owner, "Situational Scan Experience", new vec3(0, -23, -12))
    const plate = this.root.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.style = "simple"
    this.addTextureImage(this.root, SCAN_BACKGROUND_TEXTURE, 55, 68.75, "Scan Kawaii Background", new vec3(0, 0, 0.15))
    this.addZoomButton("Zoom In", "+", new vec3(20.5, 30.2, 1.3), 1)
    this.addZoomButton("Zoom Out", "−", new vec3(24.4, 30.2, 1.3), -1)
    const content = this.makeObject(this.root, "Scan Content", new vec3(0, 0, 0.6))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.autoDiscoverItemsOnStart = false
    flex.width = 48
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = 0.18
    flex.paddingTop = 1.8
    flex.paddingBottom = 1
    flex.paddingLeft = 1.3
    flex.paddingRight = 1.3
    flex.onLayoutComplete.add((result) => plate.size = new vec2(result.containerWidth, result.containerHeight))

    this.languageText = this.addText(content, "SPANISH → FRENCH", 45, 1.5, "Subheadline", LINGO_COLORS.ink)
    this.situationText = this.addText(content, "SCAN YOUR ENVIRONMENT", 45, 2.1, "Headline2", LINGO_COLORS.purple)
    this.summaryText = this.addText(content, "Look around to receive phrases you can use right now.", 45, 2, "Subheadline", LINGO_COLORS.ink)
    this.buildViewfinder(content)
    this.objectText = this.addText(content, "VISIBLE OBJECTS WILL APPEAR HERE", 45, 1.6, "Subheadline", new vec4(0.04, 0.46, 0.42, 1))
    this.savedText = this.addText(content, "0 OBJECT CARDS SAVED", 45, 1.4, "Subheadline", LINGO_COLORS.ink)
    this.buildPhraseCard(content)
    this.buildPhraseChips(content)
    this.buildActions(content)
    this.statusText = this.buildCoachRow(content)
    this.xpText = this.addText(content, "★ AUDIO 0  •  TEXT 0  •  TOTAL XP 0", 45, 1.5, "Subheadline", LINGO_COLORS.ink)
    this.internetText = this.addText(content, "", 45, 1.2, "Subheadline", new vec4(0.75, 0.16, 0.2, 1))
    this.addPracticeButton(content)
    this.hide()
  }

  show(): void { this.root.enabled = true }
  hide(): void { this.root.enabled = false }

  startRound(nativeLanguage: LanguageId, targetLanguage: LanguageId): void {
    this.nativeLanguage = nativeLanguage
    this.targetLanguage = targetLanguage
    this.languageText.text = `${languageName(nativeLanguage, nativeLanguage)} → ${languageName(targetLanguage, nativeLanguage)}`
    this.situation = null
    this.selectedObject = 0
    this.selectedPhrase = 0
    this.situationText.text = lingoCopy(nativeLanguage, "guideTitle")
    this.summaryText.text = lingoCopy(nativeLanguage, "scanPrompt")
    this.objectText.text = lingoCopy(nativeLanguage, "scanPrompt")
    this.phraseIntentText.text = lingoCopy(nativeLanguage, "guideTitle")
    this.phraseTargetText.text = "—"
    this.phraseTranslationText.text = ""
    this.phraseHintText.text = ""
    this.statusText.text = lingoCopy(nativeLanguage, "scanPrompt")
    this.scanActionContent.text = lingoCopy(nativeLanguage, "scanAgain")
    this.listenActionContent.text = lingoCopy(nativeLanguage, "listen")
    this.talkActionContent.text = lingoCopy(nativeLanguage, "holdToTalk")
    this.practiceActionContent.text = lingoCopy(nativeLanguage, "practiceSaved")
    this.clearMarkers()
    this.clearPhraseChips()
    this.show()
  }

  setInternetAvailable(available: boolean): void {
    this.internetText.text = available ? "" : lingoCopy(this.nativeLanguage, "voiceNeedsInternet")
  }

  setXp(audioXp: number, textXp: number, earned: string = ""): void {
    this.xpText.text = `★ ${lingoCopy(this.nativeLanguage, "audioXp")} ${audioXp}  •  ${lingoCopy(this.nativeLanguage, "textXp")} ${textXp}  •  ${lingoCopy(this.nativeLanguage, "totalXp")} ${audioXp + textXp}${earned ? `  ${earned}` : ""}`
    this.xpText.textFill.color = earned ? new vec4(0.05, 0.5, 0.35, 1) : LINGO_COLORS.ink
  }

  showScanner(texture: Texture): void {
    this.scanActionContent.text = lingoCopy(this.nativeLanguage, "scanAgain")
    this.setPreviewTexture(texture)
    this.situationText.text = lingoCopy(this.nativeLanguage, "guideTitle")
    this.summaryText.text = lingoCopy(this.nativeLanguage, "scanPrompt")
    this.objectText.text = lingoCopy(this.nativeLanguage, "scanPrompt")
    this.statusText.text = lingoCopy(this.nativeLanguage, "scanPrompt")
    this.clearMarkers()
    this.clearPhraseChips()
  }

  showScanning(): void {
    this.scanActionContent.text = lingoCopy(this.nativeLanguage, "scanning")
    this.situationText.text = lingoCopy(this.nativeLanguage, "scanning")
    this.summaryText.text = lingoCopy(this.nativeLanguage, "scanning")
    this.objectText.text = lingoCopy(this.nativeLanguage, "scanning")
    this.statusText.text = lingoCopy(this.nativeLanguage, "scanning")
  }

  showFailure(message: string): void {
    this.scanActionContent.text = lingoCopy(this.nativeLanguage, "scanAgain")
    this.situationText.text = lingoCopy(this.nativeLanguage, "scanFailed")
    this.summaryText.text = message
    this.objectText.text = lingoCopy(this.nativeLanguage, "scanPrompt")
    this.statusText.text = lingoCopy(this.nativeLanguage, "scanPrompt")
  }

  showSituation(situation: ScanSituation, texture: Texture, savedCount: number, readyCount: number): void {
    this.scanActionContent.text = lingoCopy(this.nativeLanguage, "scanAgain")
    this.situation = situation
    this.selectedObject = 0
    this.selectedPhrase = 0
    this.setPreviewTexture(texture)
    this.situationText.text = situation.situationTranslation.toUpperCase()
    this.summaryText.text = situation.summary
    this.rebuildMarkers()
    this.rebuildPhraseChips()
    this.selectObject(0)
    this.selectPhrase(0)
    this.setArtworkProgress(savedCount, readyCount)
    this.statusText.text = lingoCopy(this.nativeLanguage, "listenPhrase")
  }

  selectObject(index: number): void {
    if (!this.situation || this.situation.objects.length === 0) return
    this.selectedObject = Math.max(0, Math.min(index, this.situation.objects.length - 1))
    const object = this.situation.objects[this.selectedObject]
    this.objectText.text = `${object.word}  •  ${object.translation}`
    this.selectPhrase(this.selectedObject)
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].button.isOn = i === this.selectedObject
      this.markers[i].button.opacity = i === this.selectedObject ? 1 : 0.76
    }
  }

  selectPhrase(index: number): void {
    if (!this.situation || this.situation.phrases.length === 0) return
    this.selectedPhrase = Math.max(0, Math.min(index, this.situation.phrases.length - 1))
    const phrase = this.situation.phrases[this.selectedPhrase]
    this.phraseIntentText.text = phrase.intent.toUpperCase()
    this.phraseTargetText.text = phrase.target
    this.phraseTranslationText.text = phrase.translation
    this.phraseHintText.text = `${phrase.pronunciationHint}\n${lingoCopy(this.nativeLanguage, "usage")} · ${phrase.usageTip}`
    for (let i = 0; i < this.phraseChips.length; i++) {
      this.phraseChips[i].button.isOn = i === this.selectedPhrase
      this.phraseChips[i].button.opacity = i === this.selectedPhrase ? 1 : 0.68
    }
  }

  setArtworkProgress(savedCount: number, readyCount: number): void {
    this.savedText.text = `✓ ${savedCount} ${lingoCopy(this.nativeLanguage, "savedCards")}  •  ${readyCount} ${lingoCopy(this.nativeLanguage, "illustrationsReady")}`
  }

  showVoiceStatus(message: string): void {
    this.statusText.text = message
    this.statusText.textFill.color = LINGO_COLORS.ink
  }

  showPronunciationResult(correct: boolean, message: string): void {
    this.statusText.text = message
    this.statusText.textFill.color = correct ? new vec4(0.08, 0.56, 0.4, 1) : new vec4(0.82, 0.34, 0.12, 1)
  }

  private buildViewfinder(parent: SceneObject): void {
    this.previewRoot = this.makeObject(parent, "Situation Viewfinder")
    const plate = this.previewRoot.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.style = "simple"
    plate.size = new vec2(46, 18.5)
    this.registerFlexItem(parent, this.previewRoot, 46, 18.5, FlexAlignSelf.Center)

    const imageRoot = this.makeObject(this.previewRoot, "Captured Environment", new vec3(0, 0, 0.65))
    this.previewImage = imageRoot.createComponent("Component.Image") as Image
    this.previewImage.stretchMode = StretchMode.FillAndCut
    this.previewMaterial = IMAGE_MATERIAL.clone()
    this.previewMaterial.mainPass.baseColor = new vec4(1, 1, 1, 1)
    this.previewMaterial.mainPass.depthTest = true
    this.previewMaterial.mainPass.depthWrite = false
    this.previewMaterial.mainPass.twoSided = true
    this.previewMaterial.mainPass.blendMode = BlendMode.Normal
    this.previewImage.clearMaterials()
    this.previewImage.addMaterial(this.previewMaterial)
    imageRoot.getTransform().setLocalScale(new vec3(44.2, 17.1, 1))
    this.markerHost = this.makeObject(this.previewRoot, "Detected Object Markers", new vec3(0, 0, 1.25))
  }

  private buildPhraseCard(parent: SceneObject): void {
    const card = this.makeObject(parent, "Situation Phrase Card")
    const plate = card.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.style = "simple"
    plate.size = new vec2(45, 9.4)
    this.registerFlexItem(parent, card, 45, 9.4, FlexAlignSelf.Center)
    const content = this.makeObject(card, "Phrase Content", new vec3(0, 0, 0.65))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.autoDiscoverItemsOnStart = false
    flex.width = 43
    flex.height = 8.4
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.Center
    flex.rowGap = 0.12
    this.phraseIntentText = this.addText(content, "LIVE COMMUNICATION", 42, 1.15, "Subheadline", LINGO_COLORS.lavender)
    this.phraseTargetText = this.addText(content, "Useful phrases will appear after scanning", 42, 2.2, "Headline1", LINGO_COLORS.softWhite)
    this.phraseTranslationText = this.addText(content, "", 42, 1.45, "Subheadline", LINGO_COLORS.aqua)
    this.phraseHintText = this.addText(content, "", 42, 2.2, "Subheadline", LINGO_COLORS.mint)
  }

  private buildPhraseChips(parent: SceneObject): void {
    this.phraseChipRoot = this.makeObject(parent, "Phrase Choices")
    this.phraseChipFlex = this.phraseChipRoot.createComponent(FlexLayout.getTypeName()) as FlexLayout
    this.phraseChipFlex.autoDiscoverItemsOnStart = false
    this.phraseChipFlex.width = 45
    this.phraseChipFlex.height = 3
    this.phraseChipFlex.direction = FlexDirection.Row
    this.phraseChipFlex.alignItems = FlexAlign.Center
    this.phraseChipFlex.justifyContent = FlexJustify.Center
    this.phraseChipFlex.columnGap = 0.7
    this.registerFlexItem(parent, this.phraseChipRoot, 45, 3, FlexAlignSelf.Center)
  }

  private buildActions(parent: SceneObject): void {
    const row = this.makeObject(parent, "Situation Actions")
    const flex = row.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.autoDiscoverItemsOnStart = false
    flex.width = 45.5
    flex.height = 4.5
    flex.direction = FlexDirection.Row
    flex.alignItems = FlexAlign.Center
    flex.justifyContent = FlexJustify.Center
    flex.columnGap = 0.65
    this.registerFlexItem(parent, row, 45.5, 4.5, FlexAlignSelf.Center)
    this.addActionButton(row, "SCAN AGAIN", CAMERA_ICON, 13.5, "home", () => this._onScanRequested.invoke())
    this.addActionButton(row, "LISTEN", VOLUME_ICON, 12, "primary", () => this._onListenRequested.invoke())
    const talk = this.addActionButton(row, "HOLD TO TALK", MIC_ICON, 18, "primary")
    talk.onTriggerDown.add(() => this._onVoiceHoldStart.invoke())
    talk.onTriggerUp.add(() => this._onVoiceHoldEnd.invoke())
  }

  private buildCoachRow(parent: SceneObject): Text {
    const row = this.makeObject(parent, "Cloudy Coach")
    this.registerFlexItem(parent, row, 45, 12.2, FlexAlignSelf.Center)
    this.addTextureImage(row, CLOUD_MESSAGE_TEXTURE, 40, 12.69, "Cloudy Scan Message", new vec3(0, 0, 0.08))
    return this.addOverlayText(row, "Scan a place to begin.", 19.2, 7.4, "Subheadline", LINGO_COLORS.ink, new vec3(8.85, -0.05, 0.42))
  }

  private addTextureImage(parent: SceneObject, texture: Texture, width: number, height: number, name: string, position: vec3): SceneObject {
    const root = this.makeObject(parent, name, position)
    const image = root.createComponent("Component.Image") as Image
    const material = IMAGE_MATERIAL.clone()
    material.mainPass.baseTex = texture
    material.mainPass.baseColor = new vec4(1, 1, 1, 1)
    material.mainPass.depthTest = true
    material.mainPass.depthWrite = false
    material.mainPass.twoSided = true
    image.clearMaterials()
    image.addMaterial(material)
    root.getTransform().setLocalScale(new vec3(width, height, 1))
    return root
  }

  private addOverlayText(parent: SceneObject, value: string, width: number, height: number, role: TextRole, color: vec4, position: vec3): Text {
    const root = this.makeObject(parent, `Overlay-${value}`, position)
    const text = root.createComponent("Component.Text") as Text
    text.text = value
    text.font = LINGO_FONT
    text.depthTest = true
    text.size = TYPE_SCALE[role].size
    ;(text as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
    text.horizontalAlignment = HorizontalAlignment.Center
    text.verticalAlignment = VerticalAlignment.Center
    text.horizontalOverflow = HorizontalOverflow.Wrap
    text.verticalOverflow = VerticalOverflow.Shrink
    text.layoutRect = Rect.create(-width / 2, width / 2, -height / 2, height / 2)
    text.textFill.color = color
    return text
  }

  private addPracticeButton(parent: SceneObject): void {
    const slot = this.makeObject(parent, "Practice Saved Cards Slot")
    const root = this.makeObject(slot, "Practice Saved Cards", new vec3(0, 1.6, 0))
    const button = root.createComponent(Button.getTypeName()) as Button
    button.setVariant({theme: "SnapOS3", shape: "Capsule", style: "Primary"})
    styleLingoButton(button, "success")
    this.practiceActionContent = this.addOverlayText(root, "PRACTICE SAVED AI IMAGE CARDS", 30, 3.2, "Subheadline", LINGO_COLORS.white, new vec3(0, 0, 1.35))
    this.registerFlexItem(parent, slot, 32, 4.3, FlexAlignSelf.Center)
    button.onInitialized.add(() => button.size = new vec3(32, 4.3, 1))
    button.onTriggerUp.add(() => this._onPracticeSaved.invoke())
  }

  private addActionButton(
    parent: SceneObject,
    label: string,
    icon: Texture,
    width: number,
    tone: "home" | "primary",
    onClick?: () => void,
  ): Button {
    const root = this.makeObject(parent, label)
    const button = root.createComponent(Button.getTypeName()) as Button
    button.setVariant({theme: "SnapOS3", shape: "Capsule", style: "Primary"})
    styleLingoButton(button, tone)
    this.addTextureImage(root, icon, 1.65, 1.65, `${label} Icon`, new vec3(-width * 0.5 + 1.65, 0, 1.35))
    const labelText = this.addOverlayText(root, label, width - 4.2, 2.9, "Subheadline", LINGO_COLORS.white, new vec3(0.8, 0, 1.35))
    if (label === "SCAN AGAIN") this.scanActionContent = labelText
    if (label === "LISTEN") this.listenActionContent = labelText
    if (label === "HOLD TO TALK") this.talkActionContent = labelText
    this.registerFlexItem(parent, root, width, 4.15, FlexAlignSelf.Center)
    button.onInitialized.add(() => button.size = new vec3(width, 4.15, 1))
    if (onClick) button.onTriggerUp.add(onClick)
    return button
  }

  private addZoomButton(name: string, label: string, position: vec3, direction: number): void {
    const root = this.makeObject(this.root, name, position)
    const button = root.createComponent(Button.getTypeName()) as Button
    button.setVariant({theme: "SnapOS3", shape: "Round", style: "Primary"})
    styleLingoButton(button, direction > 0 ? "primary" : "neutral")
    const isZoomIn = direction > 0
    const zoomLabel = this.addOverlayText(
      root,
      label,
      isZoomIn ? 2.9 : 2.4,
      isZoomIn ? 2.9 : 2.4,
      "Zoom",
      LINGO_COLORS.white,
      new vec3(0, isZoomIn ? -0.08 : 0, 1.35)
    )
    zoomLabel.horizontalOverflow = HorizontalOverflow.Overflow
    zoomLabel.verticalOverflow = VerticalOverflow.Overflow
    button.onInitialized.add(() => button.size = new vec3(3.4, 3.4, 1))
    button.onTriggerUp.add(() => this._onZoomRequested.invoke(direction))
  }

  private rebuildMarkers(): void {
    this.clearMarkers()
    if (!this.situation) return
    for (let i = 0; i < this.situation.objects.length; i++) {
      const object = this.situation.objects[i]
      const root = this.makeObject(this.markerHost, `Marker ${i + 1}`)
      const cx = object.bounds.x + object.bounds.width * 0.5
      const cy = object.bounds.y + object.bounds.height * 0.5
      root.getTransform().setLocalPosition(new vec3((cx - 0.5) * 42, (0.5 - cy) * 16.1, 0.05))
      const button = root.createComponent(Button.getTypeName()) as Button
      button.setVariant({theme: "SnapOS3", shape: "Capsule", style: "Primary"})
      button.setIsToggleable(true)
      styleLingoButton(button, i % 2 === 0 ? "primary" : "home")
      const shortWord = object.word.length > 11 ? `${object.word.slice(0, 10)}…` : object.word
      const label = `${i + 1} · ${shortWord}`
      const width = Math.max(5.2, Math.min(10.5, 3.5 + label.length * 0.38))
      this.addOverlayText(root, label, width - 0.4, 1.8, "Caption", LINGO_COLORS.white, new vec3(0, 0, 1.35))
      button.onInitialized.add(() => button.size = new vec3(width, 2.25, 1))
      const index = i
      button.onTriggerUp.add(() => {
        this.selectObject(index)
        this._onObjectSelected.invoke(index)
        this._onPhraseSelected.invoke(index)
      })
      this.markers.push({root, button})
    }
  }

  private clearMarkers(): void {
    for (let i = 0; i < this.markers.length; i++) this.markers[i].root.destroy()
    this.markers = []
  }

  private rebuildPhraseChips(): void {
    this.clearPhraseChips()
    if (!this.situation) return
    const count = this.situation.phrases.length
    for (let i = 0; i < count; i++) {
      const root = this.makeObject(this.phraseChipRoot, `Phrase ${i + 1}`)
      const button = root.createComponent(Button.getTypeName()) as Button
      button.setVariant({theme: "SnapOS3", shape: "Round", style: "Secondary"})
      button.setIsToggleable(true)
      styleLingoButton(button, i === 0 ? "primary" : "neutral")
      this.addOverlayText(root, `${i + 1}`, 2.4, 2.4, "Caption", LINGO_COLORS.white, new vec3(0, 0, 1.35))
      const item = this.registerFlexItem(this.phraseChipRoot, root, 3, 3, FlexAlignSelf.Center)
      button.onInitialized.add(() => button.size = new vec3(3, 3, 1))
      const index = i
      button.onTriggerUp.add(() => {
        this.selectObject(index)
        this.selectPhrase(index)
        this._onObjectSelected.invoke(index)
        this._onPhraseSelected.invoke(index)
      })
      this.phraseChips.push({root, item, button})
    }
  }

  private clearPhraseChips(): void {
    if (this.phraseChips.length > 0) {
      this.phraseChipFlex.removeItems(this.phraseChips.map((chip) => chip.item))
      for (let i = 0; i < this.phraseChips.length; i++) this.phraseChips[i].root.destroy()
    }
    this.phraseChips = []
  }

  private setPreviewTexture(texture: Texture): void {
    this.previewMaterial.mainPass.baseTex = texture
    this.previewMaterial.mainPass.baseColor = new vec4(1, 1, 1, 1)
    this.previewMaterial.mainPass.depthTest = true
    this.previewMaterial.mainPass.depthWrite = false
  }

  private addText(parent: SceneObject, value: string, width: number, height: number, role: TextRole, color: vec4): Text {
    const root = this.makeObject(parent, `Text ${role}`)
    const text = root.createComponent("Component.Text") as Text
    text.text = value
    text.font = LINGO_FONT
    text.depthTest = true
    text.size = TYPE_SCALE[role].size
    ;(text as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
    text.horizontalAlignment = HorizontalAlignment.Center
    text.verticalAlignment = VerticalAlignment.Center
    text.horizontalOverflow = HorizontalOverflow.Overflow
    text.verticalOverflow = VerticalOverflow.Overflow
    text.layoutRect = Rect.create(-width / 2, width / 2, -height / 2, height / 2)
    text.textFill.color = color
    this.registerFlexItem(parent, root, width, height, FlexAlignSelf.Stretch)
    return text
  }

  private registerFlexItem(parent: SceneObject, child: SceneObject, width: number, height: number, align: FlexAlignSelf): FlexItem {
    const item = child.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideWidth = width
    item.overrideHeight = height
    item.flexShrink = 0
    item.alignSelf = align
    const flex = parent.getComponent(FlexLayout.getTypeName()) as FlexLayout | null
    if (flex) flex.addItems([item])
    return item
  }

  private makeObject(parent: SceneObject, name: string, position?: vec3): SceneObject {
    const object = global.scene.createSceneObject(name)
    object.setParent(parent)
    if (position) object.getTransform().setLocalPosition(position)
    return object
  }
}
