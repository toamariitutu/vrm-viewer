import React, { SyntheticEvent, useCallback } from 'react'
import styles from 'scss/modules/slider.module.scss'

type Props = {
  value: string | number
  max?: number
  min?: number
  step?: number
  className?: string
  onChange: (val: string) => void
}

const Slider = (props: Props) => {
  const { value, max, min, step, className, onChange } = props
  const handleChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      onChange(e.currentTarget.value)
    },
    [onChange],
  )
  return (
    <label className={`${styles.slider} ${className || ''}`}>
      <input
        type="range"
        value={value}
        max={max}
        min={min}
        step={step}
        className={styles.input}
        onChange={handleChange}
      />
    </label>
  )
}
export default Slider
