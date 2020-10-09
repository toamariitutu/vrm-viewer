import React, { useContext, useCallback, useRef, SyntheticEvent } from 'react'
import * as context from 'contexts'
import { Mode } from './Menu'

type Props = {
  className?: string
}

const ModelControls = ({ className }: Props) => {
  const loadModel = useContext(context.ModelLoaderContext)
  const [, setMenuMode] = useContext(context.MenuModeContext)
  const fileInputRef = useRef({} as HTMLInputElement)

  /**
   * ファイル選択のハンドラ
   */
  const handleFileInput = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      const files = e.currentTarget?.files
      if (!files) return
      const file = files[0]
      if (!file) return

      setMenuMode(Mode.Neutral)
      console.log(file)
      const blob = new Blob([file], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      loadModel(url)
    },
    [loadModel, setMenuMode],
  )

  const clickFileInput = useCallback(() => {
    fileInputRef.current.click()
  }, [])

  const loadDefaultModel = useCallback(() => {
    setMenuMode(Mode.Neutral)
    loadModel()
  }, [loadModel, setMenuMode])

  return (
    <div className={`p-24 ${className || ''}`}>
      <p
        className="clickable-text"
        style={{ fontSize: '2.2rem', lineHeight: 1.5, textAlign: 'center' }}
        onClick={clickFileInput}
      >
        VRMファイルを選択
      </p>
      <p
        className="clickable-text mt-24"
        style={{
          fontSize: '1.7rem',
          fontWeight: 'normal',
          lineHeight: 1.5,
          textAlign: 'center',
        }}
        onClick={loadDefaultModel}
      >
        デフォルトのモデルを表示
      </p>
      <input
        type="file"
        ref={fileInputRef}
        style={{
          display: 'none',
        }}
        onChange={handleFileInput}
      />
    </div>
  )
}
export default ModelControls
