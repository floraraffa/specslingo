/** Owns UI sounds plus an optional user-selected background track. */
const CLICK: AudioTrackAsset = requireAsset("../GeneratedSFX/ButtonClick.wav") as AudioTrackAsset
const SAVED: AudioTrackAsset = requireAsset("../GeneratedSFX/SavedToCollection.wav") as AudioTrackAsset
const SOFT_RETURN: AudioTrackAsset = requireAsset("../GeneratedSFX/SoftReturn.wav") as AudioTrackAsset

export class LingoSpaceAudioController {
  private click: AudioComponent
  private saved: AudioComponent
  private softReturn: AudioComponent
  private music: AudioComponent | null = null

  constructor(owner: SceneObject) {
    this.click = this.create(owner, CLICK, 0.55)
    this.saved = this.create(owner, SAVED, 0.22)
    this.softReturn = this.create(owner, SOFT_RETURN, 0.4)
  }

  initializeForSpecs(backgroundMusic?: AudioTrackAsset, backgroundMusicVolume: number = 0.06): void {
    this.click.playbackMode = Audio.PlaybackMode.LowLatency
    this.saved.playbackMode = Audio.PlaybackMode.LowLatency
    this.softReturn.playbackMode = Audio.PlaybackMode.LowLatency
    if (!backgroundMusic) {
      console.log("LINGO SPACE background music: none selected")
      return
    }
    const quietBackgroundVolume = Math.max(0, Math.min(0.06, backgroundMusicVolume))
    this.music = this.create(this.click.getSceneObject().getParent(), backgroundMusic, quietBackgroundVolume)
    this.music.playbackMode = Audio.PlaybackMode.LowPower
    this.music.play(-1)
    console.log(`LINGO SPACE background music: ${backgroundMusic.name}`)
  }

  playClick(): void { this.click.play(1) }
  playSaved(): void { this.saved.play(1) }
  playSoftReturn(): void { this.softReturn.play(1) }

  private create(owner: SceneObject, track: AudioTrackAsset, volume: number): AudioComponent {
    const audioObject = global.scene.createSceneObject(`Audio-${track.name}`)
    audioObject.setParent(owner)
    const component = audioObject.createComponent("Component.AudioComponent") as AudioComponent
    component.audioTrack = track
    component.volume = volume
    return component
  }
}
