import React, { useRef, useEffect, useContext, useCallback } from 'react'
import styles from 'scss/modules/main.module.scss'
import VrmManager from 'VrmManager'
import Loader from 'components/atoms/Loader'
import * as util from 'util/functions'
import * as context from 'contexts'
import { MenuMode } from 'components/molecules/MenuPanels'

type Props = {
  className?: string
}

const isMobile = util.isMobileDevice()

const acceptDnD = (
  currentMode: MenuMode,
  handler: (e: React.DragEvent) => void,
) => {
  if (!isMobile && currentMode === MenuMode.Model) return handler
  return undefined
}

const handleDragOver = (e: React.DragEvent) => e.preventDefault()

const Main = ({ className }: Props) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [isShownUi, toggleUi] = useContext(context.UIContext)
  const [, setVrmManager] = useContext(context.VrmManagerContext)
  const loadModel = useContext(context.ModelLoaderContext)
  const [currentMode, setMenuMode] = useContext(context.MenuModeContext)
  const [, showInfo] = useContext(context.InfoPanelContext)

  const mouseDowntimeRef = useRef<number>(0)

  useEffect(() => {
    const vrmManager = new VrmManager(canvasContainerRef.current!)
    setVrmManager(vrmManager)
    vrmManager.startRender()
    if (util.isMobileDevice()) {
      window.addEventListener('orientationchange', e => {
        vrmManager.resizeRender(e)
      })
    } else {
      window.addEventListener('resize', e => {
        vrmManager.resizeRender(e)
      })
    }
    loadModel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** タップ判定用 */
  const handleMouseDown = () => {
    mouseDowntimeRef.current = performance.now()
  }
  /** canvasがタップされた場合はメニューを閉じる */
  const handleMouseUp = useCallback(() => {
    const mouseUpTime = performance.now()
    if (mouseUpTime - mouseDowntimeRef.current < 200) {
      if (!isShownUi) {
        toggleUi(true)
      } else {
        setMenuMode(MenuMode.Neutral)
        showInfo(false)
      }
    }
  }, [isShownUi, toggleUi, setMenuMode, showInfo])

  /**
   * ファイル取り込み処理
   */
  const loadFile = useCallback(
    async (files: FileList | null) => {
      if (!files) return
      const file = files[0]
      if (!file) return

      setMenuMode(MenuMode.Neutral)
      const blob = new Blob([file], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      loadModel(url)
    },
    [loadModel, setMenuMode],
  )

  /**
   * ファイルドロップイベントのハンドラ
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer?.files
      loadFile(files)
    },
    [loadFile],
  )

  return (
    <>
      <div
        onPointerDown={handleMouseDown}
        onPointerUp={handleMouseUp}
        onDragOver={acceptDnD(currentMode, handleDragOver)}
        onDrop={acceptDnD(currentMode, handleDrop)}
        className={`${styles.main} ${className || ''}`}
      >
        <div
          ref={canvasContainerRef}
          className={styles['canvas-container']}
        ></div>
      </div>
      <Loader />
    </>
  )
}
export default Main
