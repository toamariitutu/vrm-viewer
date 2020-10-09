import React, { useContext, useCallback } from 'react'
import MenuItem from 'components/atoms/MenuItem'
import styles from 'scss/modules/menu.module.scss'
import { MenuModeContext } from 'contexts'

type Props = {
  className?: string
}

export enum Mode {
  Neutral = '',
  Emotion = 'Emotion',
  Face = 'Face',
  Pose = 'Pose',
  Model = 'Model',
  Option = 'Option',
}

const Menu = ({ className }: Props) => {
  const [currentMode, setMode] = useContext(MenuModeContext)
  const defaultHandleClick = useCallback(
    (mode: Mode) => () => {
      if (mode === currentMode) {
        setMode(Mode.Neutral)
      } else {
        setMode(mode)
      }
    },
    [currentMode, setMode],
  )
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.menu}>
        <ul className={styles.list}>
          <li className={`${styles.item}`}>
            <MenuItem
              name={Mode.Emotion}
              isSelected={currentMode === Mode.Emotion}
              onClick={defaultHandleClick(Mode.Emotion)}
            />
          </li>
          <li className={`${styles.item}`}>
            <MenuItem
              name={Mode.Face}
              isSelected={currentMode === Mode.Face}
              onClick={defaultHandleClick(Mode.Face)}
            />
          </li>
          <li className={`${styles.item}`}>
            <MenuItem
              name={Mode.Pose}
              isSelected={currentMode === Mode.Pose}
              onClick={defaultHandleClick(Mode.Pose)}
            />
          </li>
          <li className={`${styles.item}`}>
            <MenuItem
              name={Mode.Model}
              isSelected={currentMode === Mode.Model}
              onClick={defaultHandleClick(Mode.Model)}
            />
          </li>
          <li className={`${styles.item}`}>
            <MenuItem
              name={Mode.Option}
              isSelected={currentMode === Mode.Option}
              onClick={defaultHandleClick(Mode.Option)}
            />
          </li>
        </ul>
      </div>
    </div>
  )
}
export default Menu
