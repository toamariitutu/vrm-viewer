import { createContext } from 'react'
import { VRMSchema } from '@pixiv/three-vrm'
import VrmManager, {
  BlendShapeWeightMap,
  PresetPoses,
  initialData,
} from 'VrmManager'
import { Mode } from 'components/molecules/Menu'

type SetterFunc<T> = (val: T) => void
type Context<T, U = SetterFunc<T>> = [T, U]

/** VrmManagerのインスタンスを管理するContext */
export const VrmManagerContext = createContext<
  Context<VrmManager | null, SetterFunc<VrmManager>>
>([null, val => {}])

/** 表情のBlendShapeの各Weightを管理するContext */
export const BlendShapeContext = createContext<
  Context<
    BlendShapeWeightMap,
    (name: VRMSchema.BlendShapePresetName, weight: number) => void
  >
>([initialData.blendShape, (name, weight) => {}])

/** ポーズを管理するContext */
export const PoseContext = createContext<Context<PresetPoses>>([
  initialData.pose,
  val => {},
])

/** 視線追従の状態を管理するContext */
export const LookAtCameraContext = createContext<Context<boolean>>([
  initialData.lookAtCamera,
  val => {},
])

/** 自動まばたきの有無を管理するContext */
export const AutoBlinkContext = createContext<Context<boolean>>([
  initialData.blinkActivatd,
  val => {},
])

/** 待機モーションの有無を管理するContext */
export const WaitingAnimationContext = createContext<Context<boolean>>([
  initialData.waitingActivatd,
  val => {},
])

/** グリッド表示状態を管理するContext */
export const ShowGridContext = createContext<Context<boolean>>([
  true,
  val => {},
])
/** XYZ軸の表示状態を管理するContext */
export const ShowAxesContext = createContext<Context<boolean>>([
  true,
  val => {},
])

/** メニューのモードを管理するContext */
export const MenuModeContext = createContext<Context<Mode>>([
  Mode.Neutral,
  val => {},
])

/** InfoPnelの表示を管理するContext */
export const InfoPanelContext = createContext<Context<boolean>>([
  false,
  val => {},
])

/** UIの表示を管理するContext */
export const UIContext = createContext<Context<boolean>>([false, val => {}])

/** モデル読み込み用の関数提供用のContext */
export const ModelLoaderContext = createContext<
  (url?: string, pose?: PresetPoses) => void
>((url?: string, pose?: PresetPoses) => {})

type LoadingStatus = {
  isLoading: boolean
  progress?: number
}
type StartLoading = () => void
type StopLoading = () => void
type updateProgressFunc = (progress: number) => void
export const initialLoadingStatus: LoadingStatus = { isLoading: false }

/** Loadingの状態を管理するContext */
export const LoadingContext = createContext<
  [LoadingStatus, StartLoading, StopLoading, updateProgressFunc]
>([{ isLoading: false }, () => {}, () => {}, progress => {}])
