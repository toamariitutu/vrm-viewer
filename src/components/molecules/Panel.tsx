import React, {
  forwardRef,
  useEffect,
  MutableRefObject,
  useRef,
  useImperativeHandle,
  useState,
} from 'react'
import TabPanel from 'components/atoms/TabPanel'
import TabContent from 'components/atoms/TabContent'
import EmotionControls from 'components/molecules/EmotionControls'
import FaceControls from 'components/molecules/FaceControls'
import PoseListControls from 'components/molecules/PoseListControls'
import ModelControls from 'components/molecules/ModelControls'
import OptionControls from 'components/molecules/OptionControls'
import styles from 'scss/modules/panel.module.scss'
import { MenuMode, ScrollPosMap } from './MenuPanels'

type Props = {
  currentMode: MenuMode
  scrollPosMapRef: MutableRefObject<ScrollPosMap>
}

export type ImperativeHandle = {
  panelHeight: () => number
}

const Panel = forwardRef<ImperativeHandle, Props>(
  ({ currentMode, scrollPosMapRef }: Props, ref) => {
    const panelElemRef = useRef<HTMLDivElement>(null)
    const currentModeRef = useRef<MenuMode>(currentMode)
    // パネルの開閉状態
    const [isOpen, open] = useState(false)
    // パネル内コンテンツの表示状態
    const [isShown, show] = useState(false)
    // modeが変更時にスクロール位置を復元
    useEffect(() => {
      if (currentMode) {
        currentModeRef.current = currentMode
        // パネル内のDOMが更新されてから処理させるための遅延
        setTimeout(() => {
          panelElemRef.current!.scrollTop = scrollPosMapRef.current[currentMode]
          open(true)
          show(true)
        }, 0)
      }
      return () => {
        // スクロール位置復元時のちらつきを隠すため
        // メニュー切替時にコンテンツを一旦非表示にする
        show(false)
      }
    }, [currentMode, scrollPosMapRef])

    // パネルが閉じられた時にスクロール位置を記録
    useEffect(() => {
      const panelElem = panelElemRef.current
      const scrollPosMap = scrollPosMapRef.current
      return () => {
        scrollPosMap[currentModeRef.current] = panelElem?.scrollTop || 0
        open(false)
      }
    }, [scrollPosMapRef])

    // 親からのスクロール位置取得用
    useImperativeHandle(
      ref,
      () => ({
        panelHeight: () => panelElemRef.current?.scrollTop || 0,
      }),
      [],
    )
    return (
      <div className={`${styles.container} ${isOpen ? 'open' : ''}`}>
        <div ref={panelElemRef} className={styles.panel}>
          <TabPanel
            selectedKey={currentModeRef.current}
            className={`${styles.contents} ${isShown ? 'show' : ''}`}
          >
            <TabContent key={MenuMode.Emotion}>
              <EmotionControls />
            </TabContent>
            <TabContent key={MenuMode.Face}>
              <FaceControls />
            </TabContent>
            <TabContent key={MenuMode.Pose}>
              <PoseListControls />
            </TabContent>
            <TabContent key={MenuMode.Model}>
              <ModelControls />
            </TabContent>
            <TabContent key={MenuMode.Option}>
              <OptionControls />
            </TabContent>
          </TabPanel>
        </div>
      </div>
    )
  },
)
export default Panel
