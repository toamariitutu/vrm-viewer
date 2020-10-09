import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VRM, VRMSchema, VRMPose, VRMUtils } from '@pixiv/three-vrm'
import aStacePoseData from 'assets/poses/a_stance.json'
import tStancePoseData from 'assets/poses/t_stance.json'
import standContrappostoPoseData from 'assets/poses/standing_contrapposto.json'
import doublePeacePoseData from 'assets/poses/double_peace.json'

enum Axis {
  x = 0,
  y = 1,
  z = 2,
}

export type BlendShapeWeightMap = {
  [presetName in VRMSchema.BlendShapePresetName]?: number
}

/** BlendShapeの初期値 */
export const initialBlendShapeWeightMap: BlendShapeWeightMap = {
  [VRMSchema.BlendShapePresetName.Angry]: 0,
  [VRMSchema.BlendShapePresetName.Fun]: 0,
  [VRMSchema.BlendShapePresetName.Joy]: 0,
  [VRMSchema.BlendShapePresetName.Sorrow]: 0,
  [VRMSchema.BlendShapePresetName.Blink]: 0,
  [VRMSchema.BlendShapePresetName.BlinkR]: 0,
  [VRMSchema.BlendShapePresetName.BlinkL]: 0,
  [VRMSchema.BlendShapePresetName.A]: 0,
  [VRMSchema.BlendShapePresetName.I]: 0,
  [VRMSchema.BlendShapePresetName.U]: 0,
  [VRMSchema.BlendShapePresetName.E]: 0,
  [VRMSchema.BlendShapePresetName.O]: 0,
}

/** Blinkと干渉するBlendShapePresetNameの配列 */
const InterfereBlinkPresets = [
  VRMSchema.BlendShapePresetName.Angry,
  VRMSchema.BlendShapePresetName.Fun,
  VRMSchema.BlendShapePresetName.Joy,
  VRMSchema.BlendShapePresetName.Sorrow,
  VRMSchema.BlendShapePresetName.BlinkR,
  VRMSchema.BlendShapePresetName.BlinkL,
]

/** PresetPosesのkeyのenum */
export enum PresetPoses {
  AStance = 'aStance',
  TStance = 'tStance',
  StandingContrapposto = 'standingContrapposto',
  DoublePeace = 'doublePeace',
}

export type PresetPosesData = { key: PresetPoses; name: string; data: VRMPose }

export const presetPosesMap: {
  [name in PresetPoses]: PresetPosesData
} = {
  [PresetPoses.AStance]: {
    key: PresetPoses.AStance,
    name: 'Aスタンス',
    data: (aStacePoseData as any) as VRMPose,
  },
  [PresetPoses.TStance]: {
    key: PresetPoses.TStance,
    name: 'Tスタンス',
    data: (tStancePoseData as any) as VRMPose,
  },
  [PresetPoses.StandingContrapposto]: {
    key: PresetPoses.StandingContrapposto,
    name: 'コントラポスト立ち',
    data: (standContrappostoPoseData as any) as VRMPose,
  },
  [PresetPoses.DoublePeace]: {
    key: PresetPoses.DoublePeace,
    name: 'ダブルピース',
    data: (doublePeacePoseData as any) as VRMPose,
  },
}

export type Model = {
  name: string
  filePath: string
  meta?: VRMSchema.Meta
}

export const defaultModel = {
  name: 'Alicia Solid',
  filePath: `${process.env.PUBLIC_URL}/models/AliciaSolid.vrm`,
}

type InitialData = {
  blendShape: BlendShapeWeightMap
  manualBlinkVal: number
  pose: PresetPoses
  lookAtCamera: boolean
  blinkActivatd: boolean
  waitingActivatd: boolean
  blendShapeModified: boolean
  gridHelper: boolean
  axesHelper: boolean
}
export const initialData: InitialData = {
  blendShape: initialBlendShapeWeightMap,
  manualBlinkVal: 0,
  pose: PresetPoses.AStance,
  lookAtCamera: true,
  blinkActivatd: true,
  waitingActivatd: true,
  blendShapeModified: false,
  gridHelper: true,
  axesHelper: true,
}

class VrmManager {
  private _containerElem!: HTMLDivElement
  private _scene!: THREE.Scene
  private _pCamera!: THREE.PerspectiveCamera
  private _renderer!: THREE.WebGLRenderer
  private _controls!: OrbitControls
  private _vrm!: VRM
  private _mixer!: THREE.AnimationMixer
  private _basePosition = new THREE.Vector3()
  private _currentBlendShapeWeightMap: BlendShapeWeightMap =
    initialData.blendShape
  private _manualBlinkVal: number = initialData.manualBlinkVal
  private _currentPoseKey: PresetPoses = initialData.pose
  private _lookAtCamera: boolean = initialData.lookAtCamera
  private _blinkActivated: boolean = initialData.blinkActivatd
  private _blendShapeModified: boolean = initialData.blendShapeModified
  private _waitingActivated: boolean = initialData.waitingActivatd
  private _waitingAnimation?: THREE.AnimationAction
  private _gridHelper!: THREE.GridHelper
  private _axesHelper!: THREE.AxesHelper
  private _clock!: THREE.Clock

  constructor(containerElem: HTMLDivElement) {
    try {
      this._clock = new THREE.Clock()
      this._containerElem = containerElem
      this._scene = new THREE.Scene()
      // カメラの設定
      this._pCamera = new THREE.PerspectiveCamera(
        35,
        this._containerElem.clientWidth / this._containerElem.clientHeight,
        0.1,
        1000,
      )
      this._pCamera.position.set(0, 1.1, 3)

      // コントーロールの設定
      this._controls = new OrbitControls(this._pCamera, this._containerElem)
      this._controls.target.set(0, 0.85, 0)
      this._controls.screenSpacePanning = true
      this._controls.update()

      // レンダラーの設定
      this._renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })
      this._renderer.setSize(
        this._containerElem.clientWidth,
        this._containerElem.clientHeight,
      )
      this._renderer.setPixelRatio(window.devicePixelRatio)
      // レンダラーを反映したcanvasをDOM上にappend
      this._containerElem.appendChild(this._renderer.domElement)

      // ライトの設定
      const light = new THREE.DirectionalLight(0xffffff)
      light.position.set(1, 1, 1).normalize()
      this._scene.add(light)

      // グリッドを表示
      this._gridHelper = new THREE.GridHelper(10, 10)
      this._scene.add(this._gridHelper)
      this._gridHelper.visible = true

      // 座標軸を表示
      this._axesHelper = new THREE.AxesHelper(0.5)
      this._scene.add(this._axesHelper)
    } catch (e) {
      console.log('Error:', e)
    }
  }

  get metaInfo() {
    return this._vrm?.meta
  }

  private get blinkValue() {
    return Math.max(
      this._manualBlinkVal,
      Math.sin((this._clock.elapsedTime * 1) / 3) ** 4096 +
        Math.sin((this._clock.elapsedTime * 4) / 7) ** 4096,
    )
  }

  /**
   * VRMモデルの読み込みを行う
   * @memberof VrmManager
   */
  loadModel = async (
    url: string,
    pose?: PresetPoses,
    onProgress?: (pogress: ProgressEvent<EventTarget>) => void,
  ) => {
    try {
      // モデルをロード
      const loader = new PromiseGLTFLoader()
      const gltf = await loader.promiseLoad(url, progress => {
        if (typeof onProgress === 'function') onProgress(progress)
      })
      VRMUtils.removeUnnecessaryJoints(gltf.scene)
      const vrm = await VRM.from(gltf)
      if (this._vrm) {
        this._scene.remove(this._vrm.scene)
        this._vrm.dispose()
      }
      this._vrm = vrm
      this._scene.add(this._vrm.scene)
      this._vrm.scene.rotation.y = Math.PI
      this._vrm.lookAt!.target = this._pCamera
      this._vrm.lookAt!.autoUpdate = this._lookAtCamera
      this._mixer = new THREE.AnimationMixer(this._vrm.scene)
      this.setPresetPoses(pose || this._currentPoseKey)

      this._basePosition.copy(
        vrm.humanoid!.getBoneNode(VRMSchema.HumanoidBoneName.Hips)!.position,
      )

      this.playWaitingAnimation()

      Object.entries(this._currentBlendShapeWeightMap).forEach(
        ([name, weight]) => {
          this._vrm.blendShapeProxy!.setValue(name, weight!)
        },
      )
      this._vrm.blendShapeProxy!.update()
    } catch (e) {
      console.log('Error:', e)
    }
  }

  /**
   * 指定されたBlendShapeを更新する
   * @param {VRMSchema.BlendShapePresetName} name
   * @param {number} weight
   * @memberof VrmManager
   */
  updateBlendShape(name: VRMSchema.BlendShapePresetName, weight: number) {
    this._currentBlendShapeWeightMap[name] = weight
    this._vrm.blendShapeProxy!.setValue(name, weight)
    const isBLink = name === VRMSchema.BlendShapePresetName.Blink
    if (isBLink) {
      this._manualBlinkVal = weight
    }
    const blendShapeSeted = InterfereBlinkPresets.reduce((prev, curr) => {
      const currWeight = this._currentBlendShapeWeightMap[curr]
      return Math.max(prev || 0, currWeight || 0)
    }, 0)
    this._blendShapeModified = !!blendShapeSeted
    this._vrm.blendShapeProxy!.update()
  }

  /**
   * 定義されたポーズをモデルに反映する
   * @param {PresetPoses} poseName
   * @memberof VrmManager
   */
  setPresetPoses(poseName: PresetPoses) {
    const pose = presetPosesMap[poseName]
    if (!pose) return
    this._mixer.stopAllAction()
    this._currentPoseKey = poseName
    this._vrm.humanoid?.setPose(pose.data)
    if (this._waitingActivated) this.playWaitingAnimation()
  }

  /**
   * 視線追従を切り替える
   * @param {boolean} bool
   * @memberof VrmManager
   */
  toggleLookAtCamera(bool: boolean) {
    this._vrm.lookAt!.autoUpdate = this._lookAtCamera = bool
  }

  /**
   * まばたきアニメーションの再生を切り替える
   * @param {boolean} bool
   * @memberof VrmManager
   */
  toggleBlinkActivated(bool: boolean) {
    this._blinkActivated = bool
    if (!bool) {
      this._vrm.blendShapeProxy!.setValue(
        VRMSchema.BlendShapePresetName.Blink,
        this._manualBlinkVal,
      )
      this._vrm.blendShapeProxy!.update()
    }
  }

  /**
   * 待機モーションの再生を切り替える
   * @param {boolean} bool
   * @memberof VrmManager
   */
  toggleWaitingActivated(bool: boolean) {
    this._waitingActivated = bool
    if (bool) {
      this.playWaitingAnimation()
    } else {
      this.stopWaitingAnimation()
    }
  }

  /**
   * グリッドの表示を切り替える
   * @param {boolean} bool
   * @memberof VrmManager
   */
  toggleGrid(bool: boolean) {
    this._gridHelper.visible = bool
  }
  /**
   * 座標軸の表示を切り替える
   * @param {boolean} bool
   * @memberof VrmManager
   */
  toggleAxes(bool: boolean) {
    this._axesHelper.visible = bool
  }

  /**
   * 待機モーションを再生する
   * @memberof VrmManager
   */
  private playWaitingAnimation() {
    const bones: THREE.Bone[] = [
      VRMSchema.HumanoidBoneName.Neck,
      VRMSchema.HumanoidBoneName.Chest,
      VRMSchema.HumanoidBoneName.RightShoulder,
      VRMSchema.HumanoidBoneName.RightUpperArm,
      VRMSchema.HumanoidBoneName.LeftShoulder,
      VRMSchema.HumanoidBoneName.LeftUpperArm,
      VRMSchema.HumanoidBoneName.Hips,
      VRMSchema.HumanoidBoneName.RightUpperLeg,
      VRMSchema.HumanoidBoneName.LeftUpperLeg,
    ].map(boneName => {
      return this._vrm.humanoid?.getBoneNode(boneName)! as THREE.Bone
    })
    const clip = THREE.AnimationClip.parseAnimation(
      {
        hierarchy: [
          getWaitingAnimation(bones[0], Axis.x),
          getWaitingAnimation(bones[1], Axis.x),
          getWaitingAnimation(bones[2], Axis.z),
          getWaitingAnimation(bones[3], Axis.z, true),
          getWaitingAnimation(bones[4], Axis.z, true),
          getWaitingAnimation(bones[5], Axis.z),
          getWaitingAnimation(bones[6], Axis.x, true),
          getWaitingAnimation(bones[7], Axis.x),
          getWaitingAnimation(bones[8], Axis.x),
        ],
      },
      bones,
    )
    clip.tracks.forEach(track => {
      track.name = track.name.replace(
        /^\.bones\[([^\]]+)\].(position|quaternion|scale)$/,
        '$1.$2',
      )
    })
    this._mixer = new THREE.AnimationMixer(this._vrm.scene)
    this._waitingAnimation = this._mixer.clipAction(clip)
    this._waitingAnimation.play()
    this._waitingActivated = true
  }

  /**
   * 待機モーションを停止する
   * @memberof VrmManager
   */
  private stopWaitingAnimation() {
    this._waitingAnimation?.stop()
    this._waitingActivated = false
  }

  /**
   * windowサイズに合わせてレンダー領域をリサイズする
   * @param {Event} e
   * @memberof VrmManager
   */
  resizeRender(e: Event) {
    if (e.type === 'orientationchange') {
      // orientationchangeの場合はタイムラグを考慮して遅延させる
      setTimeout(this.updateAspect, 200)
    } else {
      this.updateAspect()
    }
  }

  /**
   * レンダリングを開始する
   * @memberof VrmManager
   */
  startRender = () => {
    this.updateRender()
  }

  /**
   * レンダリング用内部メソッド
   * @private
   * @memberof VrmManager
   */
  private updateRender = () => {
    requestAnimationFrame(this.updateRender)
    const deltaTime = this._clock.getDelta()
    if (this._vrm) {
      if (this._blinkActivated && !this._blendShapeModified) {
        this._vrm.blendShapeProxy?.setValue(
          VRMSchema.BlendShapePresetName.Blink,
          this.blinkValue,
        )
      }
      this._vrm.update(deltaTime)
    }
    if (this._mixer) {
      this._mixer.update(deltaTime)
    }

    this._renderer.render(this._scene, this._pCamera)
  }

  /**
   * レンダー領域のアスペクト比変更用内部メソッド
   * @private
   * @memberof VrmManager
   */
  private updateAspect = () => {
    this._pCamera.aspect =
      this._containerElem.clientWidth / this._containerElem.clientHeight
    this._pCamera.updateProjectionMatrix()
    this._renderer.setSize(
      this._containerElem.clientWidth,
      this._containerElem.clientHeight,
    )
  }
}
export default VrmManager

/**
 * GLTFLoaderをPromiseで扱うためのwrapperクラス
 * @class PromiseGLTFLoader
 * @extends {GLTFLoader}
 */
class PromiseGLTFLoader extends GLTFLoader {
  promiseLoad(
    url: string,
    onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined,
  ) {
    return new Promise<GLTF>((resolve, reject) => {
      super.load(url, resolve, onProgress, reject)
    })
  }
}

const waitingAnimationFrameVal = {
  '0.0': 0,
  '0.8': Math.PI / 108,
  '1.8': Math.PI / 64,
  '2.2': Math.PI / 72,
  '3.4': 0,
  '4.0': -Math.PI / 212,
  '4.5': -Math.PI / 256,
  '4.8': 0,
}

/**
 * 待機モーション共通のキーフレームアニメーション設定値を取得する
 * @param {THREE.Bone} currentBone
 * @param {Axis} axis
 * @param {boolean} [inverse]
 * @returns
 */
function getWaitingAnimation(
  currentBone: THREE.Bone,
  axis: Axis,
  inverse?: boolean,
) {
  const sign = inverse ? -1 : 1
  return {
    keys: Object.keys(waitingAnimationFrameVal).map(frame =>
      getWaitingAnimationFrameVal(
        currentBone,
        frame as keyof typeof waitingAnimationFrameVal,
        axis,
        sign,
      ),
    ),
  }
}

/**
 * 待機モーション共通のキーフレームアニメーションのフレームの設定値を取得する
 * @param {THREE.Bone} currentBone
 * @param {keyof typeof waitingAnimationFrameVal} frameString
 * @param {Axis} axis
 * @param {(1 | -1)} sign
 * @returns
 */
function getWaitingAnimationFrameVal(
  currentBone: THREE.Bone,
  frameString: keyof typeof waitingAnimationFrameVal,
  axis: Axis,
  sign: 1 | -1,
) {
  const frameVal = waitingAnimationFrameVal[frameString]
  const eulerArray: number[] = []
  for (let i = 0; i < 3; i += 1) {
    if (i === axis) {
      eulerArray.push(frameVal * sign)
    } else {
      eulerArray.push(0)
    }
  }
  return {
    rot: new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(...eulerArray))
      .multiply(currentBone.quaternion)
      .toArray(),
    time: Number(frameString),
  }
}
