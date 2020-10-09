import React, { SyntheticEvent, useCallback } from 'react'
import styles from 'scss/modules/slider.module.scss'

type Props = {
  label: string
  defaultValue?: string
  className?: string
  onChange: (val: string) => void
  onClick?: () => void
}

const Slider: React.FunctionComponent<Props> = props => {
  const { label, defaultValue, className, children, onChange, onClick } = props
  const handleChange = useCallback(
    (e: SyntheticEvent<HTMLSelectElement>) => {
      console.log(e.currentTarget.value)
      onChange(e.currentTarget.value)
    },
    [onChange],
  )
  return (
    <label className={`${styles.slider} ${className || ''}`}>
      <span>{label}：</span>
      <select
        defaultValue={defaultValue}
        onChange={handleChange}
        onClick={onClick}
      >
        {children}
      </select>
    </label>
  )
}
export default Slider
