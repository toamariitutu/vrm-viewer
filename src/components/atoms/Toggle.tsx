import React, { SyntheticEvent, useCallback } from 'react'
import styles from 'scss/modules/toggle.module.scss'

type Props = {
  name: string
  checked: boolean
  defaultValue?: string
  className?: string
  onChange: (bool: boolean) => void
}

const Toggle: React.FunctionComponent<Props> = props => {
  const { name, checked, className, onChange } = props
  const handleChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      onChange(e.currentTarget.checked)
    },
    [onChange],
  )
  return (
    <label
      className={`${styles.label} ${checked ? 'checked' : ''} ${className ||
        ''}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={handleChange}
        className={styles.input}
      />
      {/* <span className={styles.label}>{label}：</span> */}
    </label>
  )
}
export default Toggle
