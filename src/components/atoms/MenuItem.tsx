import React from 'react'
import styles from 'scss/modules/menuItem.module.scss'

type Props = {
  name: string
  isSelected: boolean
  onClick: () => void
}

const MenuItem = (props: Props) => {
  const { name, isSelected, onClick } = props
  return (
    <p
      className={`${styles.item} ${isSelected ? 'active' : ''}`}
      onClick={onClick}
    >
      <span>{name}</span>
    </p>
  )
}
export default MenuItem
