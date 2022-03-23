import React from 'react'
import MenuItem from 'components/atoms/MenuItem'
import styles from 'scss/modules/menu.module.scss'
import { MenuMode } from './MenuPanels'

type Props = {
  menuModeList: MenuMode[]
  currentMode: MenuMode
  handleMenuItemClick: (mode: MenuMode) => () => void
  className?: string
}

const Menu = ({
  menuModeList,
  currentMode,
  handleMenuItemClick,
  className,
}: Props) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.menu}>
        <ul className={styles.list}>
          {menuModeList.map((mode, i) => (
            <li key={i} className={`${styles.item}`}>
              <MenuItem
                name={mode}
                isSelected={currentMode === mode}
                onClick={handleMenuItemClick(mode)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
export default Menu
