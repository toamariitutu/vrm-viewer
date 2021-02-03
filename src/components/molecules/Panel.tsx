import React from 'react'
import TabPanel from 'components/atoms/TabPanel'
import TabContent from 'components/atoms/TabContent'
import EmotionControls from 'components/molecules/EmotionControls'
import FaceControls from 'components/molecules/FaceControls'
import PoseListControls from 'components/molecules/PoseListControls'
import ModelControls from 'components/molecules/ModelControls'
import OptionControls from 'components/molecules/OptionControls'
import styles from 'scss/modules/panel.module.scss'
import { MenuMode } from './MenuPanels'

type Props = {
  currentMode: MenuMode
  className?: string
}

const show = (currentMode: MenuMode) => {
  if (currentMode === MenuMode.Neutral) {
    return ''
  }
  return 'show'
}

const Panel = ({ currentMode }: Props) => {
  // const [localMode, setLocalMode] = useState(currentMode)

  // useEffect(() => {
  //   // モードA → Neutral → モードA と切り替えたときのモードA描画軽減＆チラつき防止用
  //   setLocalMode(prevMode =>
  //     currentMode === Mode.Neutral ? prevMode : currentMode,
  //   )
  // }, [currentMode, setMenuMode])

  return (
    <div className={`${styles.container} ${show(currentMode)}`}>
      <div className={styles.panel}>
        <TabPanel selectedKey={currentMode}>
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
}
export default Panel
