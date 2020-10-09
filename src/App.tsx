import React, { useContext, useCallback } from 'react'
import EventListener from 'react-event-listener'
import Main from 'components/molecules/Main'
import Menu from 'components/molecules/Menu'
import Panel from 'components/molecules/Panel'
import InfoPanel from 'components/atoms/InfoPanel'
import IconButton from 'components/atoms/IconButton'
import 'scss/App.scss'
import hideIcon from 'assets/images/icon_hide.svg'
import { UIContext } from 'contexts'

// Windowデフォルトのドラッグ＆ドロップイベントを無効化
const disableDnDHandler = (e: DragEvent) => e.preventDefault()

const App = () => {
  const [isShownUi, toggleUi] = useContext(UIContext)
  const handleClickIcon = useCallback(() => toggleUi(false), [toggleUi])
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
        <IconButton
          icon={hideIcon}
          label="hide"
          className="hide-icon"
          onClick={handleClickIcon}
        />
        <Menu />
        <Panel />
      </div>
      <div className="sw-update-dialog"></div>
    </div>
  )
}

export default App
