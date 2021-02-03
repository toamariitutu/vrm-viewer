import React from 'react'
import styles from 'scss/modules/floatIconButton.module.scss'

type IconType = 'info' | 'hide'
type Props = {
  iconType: IconType
  label: string
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

const IconButton = ({ iconType, label, onClick, className, style }: Props) => {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${styles.icon} ${iconType} ${className || ''}`}
      onClick={onClick}
      style={style}
    />
  )
}
export default IconButton
