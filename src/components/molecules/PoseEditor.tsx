import {
  PoseControlType,
  PoseEditorStatusContext,
  VrmManagerContext,
} from 'contexts'
import React, { useContext, useCallback } from 'react'
import styles from 'scss/modules/poseEditor.module.scss'

type Props = {
  isActive: boolean
  handleAddBtnClick: () => void
  handleSaveBtnClick: () => void
  handleCancelBtnClick: () => void
  className?: string
}

const PoseEditor = (props: Props) => {
  const [vrmManager] = useContext(VrmManagerContext)
  const [poseEditorStatus, , , , changePoseControlType, ,] = useContext(
    PoseEditorStatusContext,
  )
  const handleControlTypeButtonClick = useCallback(
    (type: PoseControlType) => () => {
      if (type === 'body') {
        vrmManager?.resetBoneControlsManipulator()
      }
      changePoseControlType(type)
    },
    [changePoseControlType, vrmManager],
  )
  return (
    <div className={`${styles.container} ${props.isActive ? 'active' : ''}`}>
      <button
        type="button"
        onClick={props.handleAddBtnClick}
        className={styles['plus-button']}
      />
      <div className={styles.editor}>
        <button
          type="button"
          onClick={props.handleSaveBtnClick}
          className={styles['save-button']}
        />
        <div className={styles.controls}>
          <button
            type="button"
            onClick={handleControlTypeButtonClick('bone')}
            className={`${styles['bone-button']} ${
              poseEditorStatus.controlType === 'bone' ? 'selected' : ''
            }`}
          />
          <button
            type="button"
            onClick={handleControlTypeButtonClick('body')}
            className={`${styles['translate-button']} ${
              poseEditorStatus.controlType === 'body' ? 'selected' : ''
            }`}
          />
        </div>
        <button
          type="button"
          onClick={props.handleCancelBtnClick}
          className={styles['cancel-button']}
        />
      </div>
    </div>
  )
}
export default PoseEditor
