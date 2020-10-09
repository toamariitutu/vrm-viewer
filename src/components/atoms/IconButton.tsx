import React from 'react'
import styles from 'scss/modules/iconButton.module.scss'

type Props = {
  icon: string
  label: string
  height?: string
  width?: string
  onClick: () => void
  className?: string
}

const IconButton = ({
  icon,
  label,
  height = '32px',
  width = '32px',
  onClick,
  className,
}: Props) => {
  const style: React.CSSProperties = {
    backgroundImage: `url(${icon})`,
    height,
    width,
  }
  return (
    <button
      aria-label={label}
      className={`${styles.icon} ${className || ''}`}
      onClick={onClick}
      style={style}
    />
  )
}
export default IconButton
