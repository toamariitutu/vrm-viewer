import React, { useContext, useCallback, useRef } from 'react'
import Menu from 'components/molecules/Menu'
import Panel, { ImperativeHandle } from 'components/molecules/Panel'
import { MenuModeContext } from 'contexts'

export enum MenuMode {
  Neutral = '',
  Emotion = 'Emotion',
  Face = 'Face',
  Pose = 'Pose',
  Model = 'Model',
  Option = 'Option',
}

export type ScrollPosMap = {
  [key in MenuMode]: number
}

const MenuPanels = () => {
  const [currentMode, setMode] = useContext(MenuModeContext)
  const scrollPosMapRef = useRef<ScrollPosMap>({} as ScrollPosMap)
  /** パネルのスクロール位置取得用ref */
  const ref = useRef<ImperativeHandle>({} as ImperativeHandle)
  const changeMenuMode = useCallback(
    (mode: MenuMode) => () => {
      if (currentMode) {
        scrollPosMapRef.current[currentMode] = ref.current.panelHeight()
      }
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
      {currentMode ? (
        <Panel
          ref={ref}
          currentMode={currentMode}
          scrollPosMapRef={scrollPosMapRef}
        />
      ) : null}
    </>
  )
}

export default MenuPanels
