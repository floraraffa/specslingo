/** Camera stream and freeze-frame capture for the SCAN learning mode. */
export type LingoSpaceCapture = {texture: Texture, base64Jpeg: string}

export class LingoSpaceCameraService {
  private cameraModule: CameraModule = require("LensStudio:CameraModule")
  private cameraTexture: Texture | null = null
  private provider: CameraTextureProvider | null = null
  private starting: Promise<Texture> | null = null

  ensureStarted(): Promise<Texture> {
    if (this.cameraTexture) return Promise.resolve(this.cameraTexture)
    if (this.starting) return this.starting

    this.starting = new Promise<Texture>((resolve, reject) => {
      try {
        const request = CameraModule.createCameraRequest()
        request.cameraId = CameraModule.CameraId.Default_Color
        request.imageSmallerDimension = 512
        const texture = this.cameraModule.requestCamera(request)
        const provider = texture.control as CameraTextureProvider
        const registration = provider.onNewFrame.add(() => {
          provider.onNewFrame.remove(registration)
          this.cameraTexture = texture
          this.provider = provider
          resolve(texture)
        })
      } catch (error) {
        this.starting = null
        reject(error)
      }
    })
    return this.starting
  }

  capture(): Promise<LingoSpaceCapture> {
    return this.ensureStarted()
      .then((texture) => this.encode(texture))
      .then((base64Jpeg) => this.decode(base64Jpeg).then((texture) => ({texture, base64Jpeg})))
  }

  /** ASR takes ownership of the sensitive sensor pipeline on Specs.
   * Drop the live camera handles after a frozen card has been created so the
   * next scanner screen requests a fresh stream instead of reusing a stalled one.
   */
  invalidateForVoice(): void {
    this.cameraTexture = null
    this.provider = null
    this.starting = null
    print("[LINGO CAMERA] live stream invalidated before voice practice")
  }

  private encode(texture: Texture): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Base64.encodeTextureAsync(
        texture,
        (encoded) => resolve(encoded),
        () => reject(new Error("Camera frame encoding failed")),
        CompressionQuality.IntermediateQuality,
        EncodingType.Jpg,
      )
    })
  }

  private decode(base64Jpeg: string): Promise<Texture> {
    return new Promise<Texture>((resolve, reject) => {
      Base64.decodeTextureAsync(
        base64Jpeg,
        (texture) => resolve(texture),
        () => reject(new Error("Captured frame decoding failed")),
      )
    })
  }
}
