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
  initialPoseEditorStatus,
  PoseControlType,
  PoseEditorStatusContext,
  initialPoseFormData,
  PoseEditorFormContext,
} from 'contexts'
import { MenuMode } from './components/molecules/MenuPanels'

/**
 * グローバルなStateを提供するComponent
 */
const Provider: React.FunctionComponent = ({ children }) => {
  const vrmManagerRef = useRef<VrmManager | null>(null)
  const [blendShapeMap, setBlenShapeState] = useState(initialVrmData.blendShape)
  const [poseId, setPoseState] = useState<string>(initialVrmData.pose)
  const [poseEditorStatus, setPoseEditorStatus] = useState(
    initialPoseEditorStatus,
  )
  const [poseFormData, setPoseFormDataState] = useState(initialPoseFormData)
  const [lookAtCamera, setLookAtCameraState] = useState(
    initialVrmData.lookAtCamera,
  )
  const [autoBlink, setAutoBlinkState] = useState(initialVrmData.blinkActivatd)
  const [waitingAnimation, setWaitingAnimationState] = useState(
    initialVrmData.waitingActivatd,
  )
  const [showGrid, setShowGridState] = useState(initialVrmData.gridHelper)
  const [showAxes, setShowAxesState] = useState(initialVrmData.axesHelper)
  const [menuMode, setMenuMode] = useState(MenuMode.Neutral)
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
  const setPose = (poseId: string) => {
    setPoseState(poseId)
    vrmManagerRef.current?.setPose(poseId)
  }
  const setPoseAddMode = () => {
    setPoseEditorStatus(prevType => ({
      ...prevType,
      editType: 'add',
      edittingPoseId: 'tempId',
      deletingPoseId: initialPoseEditorStatus.deletingPoseId,
    }))
    vrmManagerRef.current?.activateBoneControls()
    vrmManagerRef.current?.activateBodyControls()
    vrmManagerRef.current?.hideBodyControlsManipulator()
  }
  const setEditPoseId = (poseId: string) => {
    setPoseEditorStatus(prevType => ({
      ...prevType,
      editType: 'edit',
      edittingPoseId: poseId,
      deletingPoseId: initialPoseEditorStatus.deletingPoseId,
    }))
    vrmManagerRef.current?.activateBoneControls()
    vrmManagerRef.current?.activateBodyControls()
    vrmManagerRef.current?.hideBodyControlsManipulator()
  }
  const setDeletePoseId = (
    poseId: string = initialPoseEditorStatus.deletingPoseId,
  ) => {
    setPoseEditorStatus(prevType => ({
      ...prevType,
      editType: initialPoseEditorStatus.editType,
      deletingPoseId: poseId,
    }))
  }
  const changePoseControlType = (type: PoseControlType = 'bone') => {
    setPoseEditorStatus(prevType => ({
      ...prevType,
      controlType: type,
    }))
    if (type === 'bone') {
      vrmManagerRef.current?.hideBodyControlsManipulator()
      vrmManagerRef.current?.showBoneControlsManipulator()
    }
    if (type === 'body') {
      vrmManagerRef.current?.hideBoneControlsManipulator()
      vrmManagerRef.current?.showBodyControlsManipulator()
    }
  }
  const resetPoseEditorStatus = () => {
    vrmManagerRef.current?.deactivateBoneControls()
    vrmManagerRef.current?.deactivateBodyControls()
    setPoseEditorStatus(initialPoseEditorStatus)
  }
  const setPoseFormData = (val: string, key = 'poseName') => {
    setPoseFormDataState(formData => ({ ...formData, [key]: val }))
  }
  const clearPoseFormData = () => {
    setPoseFormDataState(initialPoseFormData)
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
        <PoseContext.Provider value={[poseId, setPose]}>
          <PoseEditorStatusContext.Provider
            value={[
              poseEditorStatus,
              setPoseAddMode,
              setEditPoseId,
              setDeletePoseId,
              changePoseControlType,
              resetPoseEditorStatus,
            ]}
          >
            <PoseEditorFormContext.Provider
              value={[poseFormData, setPoseFormData, clearPoseFormData]}
            >
              <LookAtCameraContext.Provider
                value={[lookAtCamera, toggleLookAtCamera]}
              >
                <AutoBlinkContext.Provider value={[autoBlink, toggleAutoBlink]}>
                  <WaitingAnimationContext.Provider
                    value={[waitingAnimation, toggleWaitingAnimation]}
                  >
                    <ShowGridContext.Provider value={[showGrid, setShowGrid]}>
                      <ShowAxesContext.Provider value={[showAxes, setShowAxes]}>
                        <MenuModeContext.Provider
                          value={[menuMode, setMenuMode]}
                        >
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
            </PoseEditorFormContext.Provider>
          </PoseEditorStatusContext.Provider>
        </PoseContext.Provider>
      </BlendShapeContext.Provider>
    </VrmManagerContext.Provider>
  )
}
export default Provider
