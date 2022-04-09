import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import {
  VRM,
  VRMSchema,
  VRMPose,
  VRMUtils,
  VRMPoseTransform,
  RawVector3,
} from '@pixiv/three-vrm'
import aStacePoseData from 'assets/poses/a_stance.json'
import tStancePoseData from 'assets/poses/t_stance.json'
import standContrappostoPoseData from 'assets/poses/standing_contrapposto.json'
import doublePeacePoseData from 'assets/poses/double_peace.json'
import { generateUuid } from 'util/functions'
import { Vector3 } from 'three'

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

export type PosesData = {
  id: string
  name: string
  data: VRMPose
  isPreset?: boolean
}
/** PresetPosesのkeyのenum */
export enum PresetPoses {
  TStance = 'tStance',
  AStance = 'aStance',
  StandingContrapposto = 'standingContrapposto',
  DoublePeace = 'doublePeace',
}
const presetPosesMap: {
  [id in PresetPoses]: PosesData
} = {
  [PresetPoses.TStance]: {
    id: PresetPoses.TStance,
    name: 'Tスタンス',
    data: (tStancePoseData as any) as VRMPose,
    isPreset: true,
  },
  [PresetPoses.AStance]: {
    id: PresetPoses.AStance,
    name: 'Aスタンス',
    data: (aStacePoseData as any) as VRMPose,
    isPreset: true,
  },
  [PresetPoses.StandingContrapposto]: {
    id: PresetPoses.StandingContrapposto,
    name: 'モデル立ち',
    data: (standContrappostoPoseData as any) as VRMPose,
    isPreset: true,
  },
  [PresetPoses.DoublePeace]: {
    id: PresetPoses.DoublePeace,
    name: 'ダブルピース',
    data: (doublePeacePoseData as any) as VRMPose,
    isPreset: true,
  },
}

export type UserPosesMap = {
  [id: string]: PosesData
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

const BONE_CONTROLS_SIZE = {
  DEFAULT: 1,
  SM: 0.1,
}

const uncontrolableBoneNameArray = [
  VRMSchema.HumanoidBoneName.Jaw,
  VRMSchema.HumanoidBoneName.LeftEye,
  VRMSchema.HumanoidBoneName.RightEye,
]

const controlableBoneNameArray = (() =>
  Object.values(VRMSchema.HumanoidBoneName).filter(
    boneName => !uncontrolableBoneNameArray.includes(boneName),
  ))()

type BoneControlsMap = {
  [key in VRMSchema.HumanoidBoneName]: TransformControls
}

type InitialData = {
  blendShape: BlendShapeWeightMap
  manualBlinkVal: number
  pose: PresetPoses
  lookAtCamera: boolean
  blinkActivatd: boolean
  waitingActivatd: boolean
  blendShapeModified: boolean
  boneControlsMap: BoneControlsMap
  boneControlling: boolean
  boneControlsHidden: boolean
  bodyControls: TransformControls | null
  gridHelper: boolean
  axesHelper: boolean
}
export const initialData: InitialData = {
  blendShape: initialBlendShapeWeightMap,
  manualBlinkVal: 0,
  pose: PresetPoses.TStance,
  lookAtCamera: true,
  blinkActivatd: true,
  waitingActivatd: true,
  blendShapeModified: false,
  boneControlsMap: {} as BoneControlsMap,
  boneControlling: false,
  boneControlsHidden: false,
  bodyControls: null,
  gridHelper: true,
  axesHelper: true,
}

class VrmManager {
  private _containerElem!: HTMLDivElement
  private _scene!: THREE.Scene
  private _pCamera!: THREE.PerspectiveCamera
  private _renderer!: THREE.WebGLRenderer
  private _orbitControls!: OrbitControls
  private _vrm!: VRM
  private _mixer!: THREE.AnimationMixer
  /** モデルの基準となるHipsのposition */
  private _basePosition = new THREE.Vector3()
  private _currentBlendShapeWeightMap: BlendShapeWeightMap =
    initialData.blendShape
  private _manualBlinkVal: number = initialData.manualBlinkVal
  private _currentPoseId: string = initialData.pose
  private _lookAtCamera: boolean = initialData.lookAtCamera
  private _blinkActivated: boolean = initialData.blinkActivatd
  private _blendShapeModified: boolean = initialData.blendShapeModified
  private _waitingActivated: boolean = initialData.waitingActivatd
  private _waitingAnimation?: THREE.AnimationAction
  private _boneControlsMap: BoneControlsMap = initialData.boneControlsMap
  private _boneControlling: boolean = initialData.boneControlling
  private _activatingBoneName: VRMSchema.HumanoidBoneName | null = null
  private _boneControlsHidden: boolean = initialData.boneControlsHidden
  private _bodyControls: TransformControls | null = initialData.bodyControls
  /** ボーン操作用のマニュピレーターがタップされたかの判定用 */
  private _boneManipulatorTapped = false
  private _gridHelper!: THREE.GridHelper
  private _axesHelper!: THREE.AxesHelper
  private _clock!: THREE.Clock
  /** タップ判定用 */
  private _pointerDownTime = 0

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

      // カメラコントロールの設定
      this._orbitControls = new OrbitControls(
        this._pCamera,
        this._containerElem,
      )
      this._orbitControls.target.set(0, 0.85, 0)
      this._orbitControls.screenSpacePanning = true
      this._orbitControls.addEventListener('start', e => {
        this._pointerDownTime = performance.now()
      })
      this._orbitControls.addEventListener('end', e => {
        const pointerUpTime = performance.now()
        if (pointerUpTime - this._pointerDownTime < 200) {
          if (!this._boneControlsHidden && !this._boneManipulatorTapped) {
            this.resetBoneControlsManipulator()
          }
        }
        this._boneManipulatorTapped = false
      })
      this._orbitControls.update()

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

  static get presetPosesMap() {
    return presetPosesMap
  }
  static get userPosesMap() {
    try {
      const localStorageVal = localStorage.getItem('poses')
      const userPoseMap: UserPosesMap = localStorageVal
        ? JSON.parse(localStorageVal)
        : {}
      return userPoseMap
    } catch (error) {
      console.error(error)
      return {}
    }
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

      this._basePosition.copy(
        vrm.humanoid!.getBoneNode(VRMSchema.HumanoidBoneName.Hips)!.position,
      )

      this.setPose(pose || this._currentPoseId)
      if (this._waitingActivated) {
        this.playWaitingAnimation()
      }

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
   * @param {PresetPoses} id
   * @memberof VrmManager
   */
  setPose(id: PresetPoses | string) {
    let pose = VrmManager.presetPosesMap[id as PresetPoses]
    if (!pose) {
      // プリセットになかった場合localStorage参照
      pose = VrmManager.userPosesMap[id]
    }
    if (!pose) {
      // localStorageにもなかった場合何もしない
      return
    }
    this._mixer.stopAllAction()
    this._currentPoseId = id
    this._vrm.humanoid?.setPose(pose.data)
    if (
      this._waitingActivated &&
      !this._boneControlling &&
      !this._bodyControls
    ) {
      this.playWaitingAnimation()
    }
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
    if (!this._boneControlling && !this._bodyControls) {
      const bones: THREE.Bone[] = [
        VRMSchema.HumanoidBoneName.Neck,
        VRMSchema.HumanoidBoneName.Chest,
        VRMSchema.HumanoidBoneName.Spine,
        VRMSchema.HumanoidBoneName.RightShoulder,
        VRMSchema.HumanoidBoneName.RightUpperArm,
        VRMSchema.HumanoidBoneName.LeftShoulder,
        VRMSchema.HumanoidBoneName.LeftUpperArm,
      ].map(boneName => {
        return this._vrm.humanoid?.getBoneNode(boneName)! as THREE.Bone
      })
      let index = 0
      const clip = THREE.AnimationClip.parseAnimation(
        {
          hierarchy: [
            getWaitingAnimation(bones[index++], Axis.x),
            getWaitingAnimation(bones[index++], Axis.x),
            getWaitingAnimation(bones[index++], Axis.x, true),
            getWaitingAnimation(bones[index++], Axis.z),
            getWaitingAnimation(bones[index++], Axis.z, true),
            getWaitingAnimation(bones[index++], Axis.z, true),
            getWaitingAnimation(bones[index++], Axis.z),
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
    }
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
   * ボーンコントロールを有効にする
   * @memberof VrmManager
   */
  activateBoneControls() {
    if (this._waitingActivated) {
      this._waitingAnimation?.stop()
    }

    this._boneControlling = true

    if (Object.values(this._boneControlsMap).length) {
      return
    }

    controlableBoneNameArray.forEach(boneName => {
      const transformControls = new TransformControls(
        this._pCamera,
        this._containerElem,
      )
      transformControls.setMode('rotate')
      transformControls.setSpace('local')
      transformControls.setSize(BONE_CONTROLS_SIZE.SM)
      // マニュピレータータップ時
      transformControls.addEventListener('mouseDown', e => {
        if (!this._activatingBoneName) {
          // if (this._activatingBoneName) {
          //   const activatingBoneControls = this._boneControlsMap[
          //     this._activatingBoneName
          //   ]
          //   activatingBoneControls.setSize(BONE_CONTROLS_SIZE.SM)
          // }
          this._activatingBoneName = boneName
          transformControls.setSize(BONE_CONTROLS_SIZE.DEFAULT)
          controlableBoneNameArray.forEach(b => {
            if (b !== boneName) {
              const boneControls = this._boneControlsMap[b]
              boneControls.showX = false
              boneControls.showY = false
              boneControls.showZ = false
            }
          })
        }
      })
      transformControls.addEventListener('mouseUp', e => {
        this._boneManipulatorTapped = true
      })
      // マニュピレーター操作時にカメラ操作を止める
      transformControls.addEventListener('dragging-changed', event => {
        this._orbitControls.enabled = !event.value
      })
      if (this._vrm.humanoid?.getBoneNode(boneName)) {
        transformControls.attach(this._vrm.humanoid?.getBoneNode(boneName)!)
      }
      this._scene.add(transformControls)
      this._boneControlsMap[boneName] = transformControls
    })
  }

  /**
   * ボーンコントロールを無効にする
   * @memberof VrmManager
   */
  deactivateBoneControls() {
    Object.entries(this._boneControlsMap).forEach(
      ([poseId, transformControls]) => {
        transformControls.detach()
        transformControls.dispose()
        delete this._boneControlsMap[poseId as VRMSchema.HumanoidBoneName]
      },
    )
    this._activatingBoneName = null
    this._boneControlling = false
    if (this._waitingActivated) {
      this.playWaitingAnimation()
    }
  }

  /**
   * ボーンコントロールのマニュピレーター表示をリセットする
   * @memberof VrmManager
   */
  resetBoneControlsManipulator() {
    Object.values(this._boneControlsMap).forEach(boneControls => {
      boneControls.setSize(BONE_CONTROLS_SIZE.SM)
      boneControls.showX = true
      boneControls.showY = true
      boneControls.showZ = true
    })
    this._activatingBoneName = null
  }
  /**
   * ボーンコントロールのマニュピレーターを表示する
   * @memberof VrmManager
   */
  showBoneControlsManipulator() {
    Object.values(this._boneControlsMap).forEach(boneControls => {
      boneControls.showX = true
      boneControls.showY = true
      boneControls.showZ = true
    })
    this._boneControlsHidden = false
  }
  /**
   * ボーンコントロールのマニュピレーターを非表示にする
   * @memberof VrmManager
   */
  hideBoneControlsManipulator() {
    Object.values(this._boneControlsMap).forEach(boneControls => {
      boneControls.showX = false
      boneControls.showY = false
      boneControls.showZ = false
    })
    this._boneControlsHidden = true
  }

  /**
   * ボディのコントロールを有効にする
   * @memberof VrmManager
   */
  activateBodyControls() {
    if (this._waitingActivated) {
      this._waitingAnimation?.stop()
    }
    if (!this._bodyControls) {
      const transformControls = new TransformControls(
        this._pCamera,
        this._containerElem,
      )
      transformControls.setMode('translate')
      transformControls.setSpace('global')
      transformControls.setSize(BONE_CONTROLS_SIZE.DEFAULT)
      // マニュピレーター操作時にカメラ操作を止める
      transformControls.addEventListener('dragging-changed', event => {
        this._orbitControls.enabled = !event.value
      })
      transformControls.attach(
        this._vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Hips)!,
      )
      this._scene.add(transformControls)
      this._bodyControls = transformControls
    }
  }
  /**
   * ボディコントロールを無効にする
   * @memberof VrmManager
   */
  deactivateBodyControls() {
    if (!this._bodyControls) return
    this._bodyControls.detach()
    this._bodyControls.dispose()
    this._bodyControls = null
    if (this._waitingActivated) {
      this.playWaitingAnimation()
    }
  }
  /**
   * ボディコントロールのマニュピレーターを表示する
   * @memberof VrmManager
   */
  showBodyControlsManipulator() {
    if (!this._bodyControls) return
    this._bodyControls.showX = true
    this._bodyControls.showY = true
    this._bodyControls.showZ = true
  }
  /**
   * ボディコントロールのマニュピレーターを非表示にする
   * @memberof VrmManager
   */
  hideBodyControlsManipulator() {
    if (!this._bodyControls) return
    this._bodyControls.showX = false
    this._bodyControls.showY = false
    this._bodyControls.showZ = false
  }

  /**
   * ポーズデータを保存する
   * @param {string} poseName
   * @param {string} [poseId]
   * @memberof VrmManager
   */
  savePoseData(poseName: string, poseId?: string) {
    try {
      const tempPoseData = this._vrm.humanoid?.getPose()
      if (!tempPoseData) throw new Error('Failed to get pose. ')
      const currentPoseData: VRMPose = {}
      // getPoseしたデータの内rotationのみ抽出
      Object.entries(tempPoseData).forEach(([key, value]) => {
        if (value) {
          const poseTransform: VRMPoseTransform = { rotation: value.rotation }
          if (key === VRMSchema.HumanoidBoneName.Hips) {
            // Hipsのみモデルの基準となるのでpositionを拾う
            const hipsPosVector3 = new Vector3().fromArray(
              value.position || [0, 0, 0],
            )
            const relativePosVector3 = hipsPosVector3.sub(this._basePosition)
            poseTransform.position = relativePosVector3.toArray() as RawVector3
          }
          currentPoseData[key] = poseTransform
        }
      })
      const currentUserPosesMap: UserPosesMap = JSON.parse(
        localStorage.getItem('poses') || '{}',
      )
      const name =
        poseName || `ポーズ ${Object.keys(currentUserPosesMap).length + 1}`
      const id = poseId || generateUuid()
      const poseData: PosesData = {
        id,
        name,
        data: currentPoseData,
      }
      const modifiedUserPosesMap = {
        ...currentUserPosesMap,
        [id]: poseData,
      }
      localStorage.setItem('poses', JSON.stringify(modifiedUserPosesMap))
      return { succeed: true, id }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        return { succeed: false, error: '保存可能容量を超えています。' }
      }
      console.error(error)
      return { succeed: false, error: '保存に失敗しました。' }
    }
  }

  /**
   * ポーズデータを削除する
   * @param {string} poseId
   * @memberof VrmManager
   */
  deletePoseData(poseId: string) {
    try {
      const userPosesMap: UserPosesMap = JSON.parse(
        localStorage.getItem('poses') || '{}',
      )
      delete userPosesMap[poseId]
      localStorage.setItem('poses', JSON.stringify(userPosesMap))
      return { succeed: true }
    } catch (error) {
      console.error(error)
      return { succeed: false, error: '削除に失敗しました。' }
    }
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
