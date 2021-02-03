import React, { useContext, useCallback } from 'react'
import Menu from 'components/molecules/Menu'
import Panel from 'components/molecules/Panel'
import { MenuModeContext } from 'contexts'

export enum MenuMode {
  Neutral = '',
  Emotion = 'Emotion',
  Face = 'Face',
  Pose = 'Pose',
  Model = 'Model',
  Option = 'Option',
}

const MenuPanels = () => {
  const [currentMode, setMode] = useContext(MenuModeContext)
  const changeMenuMode = useCallback(
    (mode: MenuMode) => () => {
      if (mode === currentMode) {
        setMode(MenuMode.Neutral)
      } else {
        setMode(mode)
      }
    },
    [currentMode, setMode],
  )
  return (
    <>
      <Menu
        menuModeList={Object.values(MenuMode).filter(mode => !!mode)}
        currentMode={currentMode}
        handleMenuItemClick={changeMenuMode}
      />
      <Panel currentMode={currentMode} />
    </>
  )
}

export default MenuPanels
