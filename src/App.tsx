import React, { useContext, useCallback } from 'react'
import EventListener from 'react-event-listener'
import Main from 'components/molecules/Main'
import MenuPanels from 'components/molecules/MenuPanels'
import InfoPanel from 'components/atoms/InfoPanel'
import FloatIconButton from 'components/atoms/FloatIconButton'
import 'scss/App.scss'
import { PoseEditorStatusContext, UIContext, VrmManagerContext } from 'contexts'

// Windowデフォルトのドラッグ＆ドロップイベントを無効化
const disableDnDHandler = (e: DragEvent) => e.preventDefault()

const App = () => {
  const [isShownUi, toggleUi] = useContext(UIContext)
  const [vrmManager] = useContext(VrmManagerContext)
  const [poseEditorStatus] = useContext(PoseEditorStatusContext)
  const hideUi = useCallback(() => {
    toggleUi(false)
    if (poseEditorStatus.controlType === 'bone') {
      vrmManager?.hideBoneControlsManipulator()
    }
    if (poseEditorStatus.controlType === 'body') {
      vrmManager?.hideBodyControlsManipulator()
    }
  }, [poseEditorStatus.controlType, toggleUi, vrmManager])
  return (
    <div className="App">
      <EventListener
        target="window"
        onDragOver={disableDnDHandler}
        onDrop={disableDnDHandler}
      />
      <Main />
      <div className={`ui-layer ${isShownUi ? '' : 'hidden'}`}>
        <InfoPanel />
        <FloatIconButton
          iconType="hide"
          label="hide"
          className="hide-icon"
          onClick={hideUi}
        />
        <MenuPanels />
      </div>
      <div className="sw-update-dialog"></div>
    </div>
  )
}

export default App
