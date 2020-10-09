import React, { useState, useRef, useCallback } from 'react'
import { VRMSchema } from '@pixiv/three-vrm'
import VrmManager, {
  initialData as initialVrmData,
  PresetPoses,
  defaultModel,
} from 'VrmManager'
import {
  initialLoadingStatus,
  VrmManagerContext,
  BlendShapeContext,
  PoseContext,
  LookAtCameraContext,
  LoadingContext,
  MenuModeContext,
  ShowGridContext,
  ShowAxesContext,
  AutoBlinkContext,
  WaitingAnimationContext,
  ModelLoaderContext,
  InfoPanelContext,
  UIContext,
} from 'contexts'
import { Mode } from 'components/molecules/Menu'

/**
 * グローバルなStateを提供するComponent
 */
const Provider: React.FunctionComponent = ({ children }) => {
  const vrmManagerRef = useRef<VrmManager | null>(null)
  const [blendShapeMap, setBlenShapeState] = useState(initialVrmData.blendShape)
  const [pose, setPoseState] = useState(initialVrmData.pose)
  const [lookAtCamera, setLookAtCameraState] = useState(
    initialVrmData.lookAtCamera,
  )
  const [autoBlink, setAutoBlinkState] = useState(initialVrmData.blinkActivatd)
  const [waitingAnimation, setWaitingAnimationState] = useState(
    initialVrmData.waitingActivatd,
  )
  const [showGrid, setShowGridState] = useState(initialVrmData.gridHelper)
  const [showAxes, setShowAxesState] = useState(initialVrmData.axesHelper)
  const [menuMode, setMenuMode] = useState(Mode.Neutral)
  const [showInfo, setShowInfo] = useState(false)
  const [isShown, toggleUi] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(initialLoadingStatus)

  const setVrmManager = (instance: VrmManager) => {
    vrmManagerRef.current = instance
  }
  const setBlendShape = (
    name: VRMSchema.BlendShapePresetName,
    weight: number,
  ) => {
    setBlenShapeState(prevState => ({ ...prevState, [name]: weight }))
    vrmManagerRef.current?.updateBlendShape(name, weight)
  }
  const setPose = (pose: PresetPoses) => {
    setPoseState(pose)
    vrmManagerRef.current?.setPresetPoses(pose)
  }
  const toggleLookAtCamera = (bool: boolean) => {
    setLookAtCameraState(bool)
    vrmManagerRef.current?.toggleLookAtCamera(bool)
  }
  const toggleAutoBlink = (bool: boolean) => {
    setAutoBlinkState(bool)
    vrmManagerRef.current?.toggleBlinkActivated(bool)
  }
  const toggleWaitingAnimation = (bool: boolean) => {
    setWaitingAnimationState(bool)
    vrmManagerRef.current?.toggleWaitingActivated(bool)
  }
  const setShowGrid = (bool: boolean) => {
    setShowGridState(bool)
    vrmManagerRef.current?.toggleGrid(bool)
  }
  const setShowAxes = (bool: boolean) => {
    setShowAxesState(bool)
    vrmManagerRef.current?.toggleAxes(bool)
  }
  const startLoading = () => {
    setLoadingStatus({ isLoading: true })
  }
  const stopLoading = () => {
    setLoadingStatus({ isLoading: false, progress: undefined })
  }
  const updateProgress = (progress: number) => {
    setLoadingStatus(prevState => ({ ...prevState, progress }))
  }

  /**
   * モデル読み込み処理。
   * urlを指定しない場合デフォルトのモデルを読み込む。
   */
  const loadModel = useCallback(
    async (url: string = defaultModel.filePath, pose?: PresetPoses) => {
      startLoading()
      await vrmManagerRef.current?.loadModel(url, pose, e => {
        const progress = e.loaded / e.total
        updateProgress(
          Number.isFinite(progress) ? Math.round(100 * progress) : 100,
        )
      })
      stopLoading()
    },
    [],
  )

  return (
    <VrmManagerContext.Provider value={[vrmManagerRef.current, setVrmManager]}>
      <BlendShapeContext.Provider value={[blendShapeMap, setBlendShape]}>
        <PoseContext.Provider value={[pose, setPose]}>
          <LookAtCameraContext.Provider
            value={[lookAtCamera, toggleLookAtCamera]}
          >
            <AutoBlinkContext.Provider value={[autoBlink, toggleAutoBlink]}>
              <WaitingAnimationContext.Provider
                value={[waitingAnimation, toggleWaitingAnimation]}
              >
                <ShowGridContext.Provider value={[showGrid, setShowGrid]}>
                  <ShowAxesContext.Provider value={[showAxes, setShowAxes]}>
                    <MenuModeContext.Provider value={[menuMode, setMenuMode]}>
                      <InfoPanelContext.Provider
                        value={[showInfo, setShowInfo]}
                      >
                        <UIContext.Provider value={[isShown, toggleUi]}>
                          <LoadingContext.Provider
                            value={[
                              loadingStatus,
                              startLoading,
                              stopLoading,
                              updateProgress,
                            ]}
                          >
                            <ModelLoaderContext.Provider value={loadModel}>
                              {children}
                            </ModelLoaderContext.Provider>
                          </LoadingContext.Provider>
                        </UIContext.Provider>
                      </InfoPanelContext.Provider>
                    </MenuModeContext.Provider>
                  </ShowAxesContext.Provider>
                </ShowGridContext.Provider>
              </WaitingAnimationContext.Provider>
            </AutoBlinkContext.Provider>
          </LookAtCameraContext.Provider>
        </PoseContext.Provider>
      </BlendShapeContext.Provider>
    </VrmManagerContext.Provider>
  )
}
export default Provider
