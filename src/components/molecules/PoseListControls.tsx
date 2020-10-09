import React, { useContext, useCallback } from 'react'
import { PresetPoses, presetPosesMap } from 'VrmManager'
import { PoseContext } from 'contexts'
import styles from 'scss/modules/selectList.module.scss'

type Props = {
  className?: string
}

const PoseListControls = ({ className }: Props) => {
  const [curretPose, setPose] = useContext(PoseContext)

  const handleClick = useCallback((val: PresetPoses) => () => setPose(val), [
    setPose,
  ])
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <ul className={styles.list}>
        {Object.values(presetPosesMap).map((poseData, i) => (
          <li
            key={i}
            className={`${styles.item} ${
              poseData.key === curretPose ? 'selected' : ''
            }`}
            onClick={handleClick(poseData.key)}
          >
            {poseData.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default PoseListControls
