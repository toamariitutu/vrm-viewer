import React, {
  useContext,
  useCallback,
  useState,
  SyntheticEvent,
  useMemo,
} from 'react'
import VrmManager, { PosesData } from 'VrmManager'
import {
  PoseContext,
  PoseEditorFormContext,
  PoseEditorStatusContext,
  VrmManagerContext,
} from 'contexts'
import styles from 'scss/modules/selectList.module.scss'
import PoseEditor from './PoseEditor'
import { useIsMountedRef } from 'util/hooks'

type Props = {
  scrollToBottom: () => void
  className?: string
}

const newPoseData: PosesData = { id: 'tempId', name: 'ほげ', data: {} }

const PoseListControls = ({ scrollToBottom, className }: Props) => {
  const [vrmManager] = useContext(VrmManagerContext)
  const [curretPoseId, setPose] = useContext(PoseContext)
  const [poseFormData, setPoseName, clearPoseFormData] = useContext(
    PoseEditorFormContext,
  )
  const [
    poseEditorStatus,
    setPoseAddMode,
    setEditPoseId,
    setDeletePoseId,
    ,
    resetPoseEditorStatus,
  ] = useContext(PoseEditorStatusContext)
  const [userPosesList, setUserPosesList] = useState<PosesData[]>(
    Object.values(VrmManager.userPosesMap),
  )
  const [confirmMessage, setConfirmMessage] = useState('削除しますか？')
  const [savedMessage, setSavedMessage] = useState('')
  const [messageType, toggleMessage] = useState<'' | 'success' | 'error'>('')
  const [isDeleted, setDeleted] = useState(false)
  const isMountedRef = useIsMountedRef()
  const isAddMode = useMemo(() => poseEditorStatus.editType === 'add', [
    poseEditorStatus.editType,
  ])
  const itemCss = useCallback(
    (poseId: string) => {
      const css: string[] = []
      if (poseId === curretPoseId) {
        css.push('selected')
      }
      if (poseId === poseEditorStatus.edittingPoseId) {
        css.push('editting')
      }
      if (poseId === poseEditorStatus.deletingPoseId) {
        css.push('deleting')
      }
      return css.join(' ')
    },
    [
      curretPoseId,
      poseEditorStatus.deletingPoseId,
      poseEditorStatus.edittingPoseId,
    ],
  )

  /** ポーズ追加モードにする */
  const setAddMode = useCallback(() => {
    setPoseAddMode()
    setPose(newPoseData.id)
    setTimeout(scrollToBottom, 0)
  }, [scrollToBottom, setPose, setPoseAddMode])

  /** モードをリセットする */
  const resetMode = useCallback(() => {
    resetPoseEditorStatus()
    setTimeout(clearPoseFormData, 110)
  }, [clearPoseFormData, resetPoseEditorStatus])

  /** ポーズを保存する */
  const savePose = useCallback(() => {
    try {
      const { succeed, id, error } = vrmManager!.savePoseData(
        poseFormData.poseName,
        isAddMode ? undefined : poseEditorStatus.edittingPoseId,
      )
      if (!succeed) {
        throw new Error(error)
      }
      setSavedMessage('保存しました。')
      toggleMessage('success')
      setTimeout(() => {
        resetMode()
        if (isMountedRef.current) {
          setUserPosesList(Object.values(VrmManager.userPosesMap))
        }
        setPose(id!)
      }, 300)
      setTimeout(() => {
        if (isMountedRef.current) {
          toggleMessage('')
        }
      }, 1500)
    } catch (e) {
      console.error(e.message)
      setSavedMessage(e.message)
      toggleMessage('error')
      setTimeout(() => {
        if (isMountedRef.current) {
          toggleMessage('')
        }
      }, 10000)
    }
  }, [
    isAddMode,
    isMountedRef,
    poseEditorStatus.edittingPoseId,
    poseFormData.poseName,
    resetMode,
    setPose,
    vrmManager,
  ])

  /** リスト中のアイテム押下時の処理 */
  const handleListItemClick = useCallback(
    (poseId: string) => () => {
      if (poseId !== curretPoseId) {
        resetMode()
      }
      if (
        !poseEditorStatus.editType ||
        poseId !== poseEditorStatus.edittingPoseId
      ) {
        setPose(poseId)
      }
    },
    [
      curretPoseId,
      poseEditorStatus.editType,
      poseEditorStatus.edittingPoseId,
      resetMode,
      setPose,
    ],
  )

  /** リスト中のアイテム内の編集ボタン押下時の処理 */
  const handleEditBtnClick = useCallback(
    (poseData: PosesData) => (e: React.SyntheticEvent) => {
      e.stopPropagation()
      setPoseName(poseData.name)
      setEditPoseId(poseData.id)
      vrmManager?.activateBoneControls()
    },
    [setEditPoseId, setPoseName, vrmManager],
  )

  /** リスト中のアイテム内の削除ボタン押下時の処理 */
  const handleDeleteBtnClick = useCallback(
    (poseId: string) => (e: React.SyntheticEvent) => {
      e.stopPropagation()
      setConfirmMessage('削除しますか？')
      setDeletePoseId(poseId)
    },
    [setDeletePoseId],
  )
  /** 削除実行ボタン押下時の処理 */
  const handleDeleteOkBtnClick = useCallback(
    (poseId: string) => (e: React.SyntheticEvent) => {
      e.stopPropagation()
      try {
        const { succeed, error } = vrmManager!.deletePoseData(poseId)
        if (!succeed) {
          throw new Error(error)
        }
        setDeleted(true)
        setConfirmMessage('削除しました。')
        setTimeout(() => {
          if (isMountedRef.current) {
            setUserPosesList(Object.values(VrmManager.userPosesMap))
            setDeleted(false)
          }
          resetPoseEditorStatus()
        }, 1200)
      } catch (e) {
        console.error(e.message)
      }
    },
    [isMountedRef, resetPoseEditorStatus, vrmManager],
  )
  /** 削除キャンセルボタン押下時の処理 */
  const handleDeleteCancelBtnClick = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      resetPoseEditorStatus()
    },
    [resetPoseEditorStatus],
  )

  /** ポーズ名入力時の処理 */
  const handlePoseNameChange = (e: SyntheticEvent<HTMLInputElement>) => {
    setPoseName(e.currentTarget.value)
  }
  return (
    <>
      <div className={`${styles.container} ${className || ''}`}>
        <ul className={styles.list}>
          {Object.values(VrmManager.presetPosesMap).map((poseData, i) => (
            <li
              key={i}
              className={`${styles.item} ${
                poseData.id === curretPoseId ? 'selected' : ''
              } ${
                poseData.id === poseEditorStatus.edittingPoseId
                  ? 'editting'
                  : ''
              }`}
              onClick={handleListItemClick(poseData.id)}
            >
              <p className={styles['item__name']}>{poseData.name}</p>
            </li>
          ))}
          {userPosesList.map((poseData, j) => (
            <li
              key={j}
              className={`${styles.item} ${itemCss(poseData.id)}`}
              onClick={handleListItemClick(poseData.id)}
            >
              <button
                type="button"
                className={styles['edit-button']}
                onClick={handleEditBtnClick(poseData)}
              />
              <p className={styles['item__name']}>{poseData.name}</p>
              <button
                type="button"
                className={styles['delete-button']}
                onClick={handleDeleteBtnClick(poseData.id)}
              />
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  value={poseFormData.poseName}
                  onChange={handlePoseNameChange}
                  placeholder="ポーズ名を入力…"
                  className={styles.input}
                />
                <div className={styles.underline}></div>
              </form>
              <div
                className={`${styles.confirm} ${
                  poseData.id === poseEditorStatus.deletingPoseId && isDeleted
                    ? 'deleted'
                    : ''
                }`}
              >
                <button
                  type="button"
                  className={styles['delete-ok']}
                  onClick={handleDeleteOkBtnClick(poseData.id)}
                />
                <p className={styles['delete-text']}>{confirmMessage}</p>
                <button
                  type="button"
                  className={styles['delete-cancel']}
                  onClick={handleDeleteCancelBtnClick}
                />
              </div>
            </li>
          ))}
          {isAddMode && (
            <li
              className={`${styles.item} ${
                curretPoseId === newPoseData.id ? 'selected' : ''
              } ${
                poseEditorStatus.edittingPoseId === newPoseData.id
                  ? 'editting'
                  : ''
              }`}
              onClick={handleListItemClick(newPoseData.id)}
            >
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  value={poseFormData.poseName}
                  onChange={handlePoseNameChange}
                  placeholder="ポーズ名を入力…"
                  className={styles.input}
                />
                <div className={styles.underline}></div>
              </form>
            </li>
          )}
        </ul>
      </div>
      <div className={styles['sticky-container']}>
        <PoseEditor
          isActive={!!poseEditorStatus.editType}
          handleAddBtnClick={setAddMode}
          handleSaveBtnClick={savePose}
          handleCancelBtnClick={resetMode}
        />
        <div className={`${styles['message-container']} ${messageType}`}>
          <p className={styles['message-text']}>{savedMessage}</p>
        </div>
      </div>
    </>
  )
}
export default PoseListControls

const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault()
  const elem = document.activeElement
  if (elem instanceof HTMLElement) {
    elem.blur()
  }
}
