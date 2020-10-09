import React, { useContext, useState, useEffect } from 'react'
import TabPanel from 'components/atoms/TabPanel'
import TabContent from 'components/atoms/TabContent'
import EmotionControls from 'components/molecules/EmotionControls'
import FaceControls from 'components/molecules/FaceControls'
import PoseListControls from 'components/molecules/PoseListControls'
import ModelControls from 'components/molecules/ModelControls'
import OptionControls from 'components/molecules/OptionControls'
import styles from 'scss/modules/panel.module.scss'
import * as context from 'contexts'
import { Mode } from './Menu'

type Props = {
  className?: string
}

const show = (currentMode: Mode) => {
  if (currentMode === Mode.Neutral) {
    return ''
  }
  return 'show'
}

const Panel = ({ className }: Props) => {
  const [currentMode, setMenuMode] = useContext(context.MenuModeContext)
  const [localMode, setLocalMode] = useState(currentMode)

  useEffect(() => {
    setLocalMode(prevMode =>
      currentMode === Mode.Neutral ? prevMode : currentMode,
    )
  }, [currentMode, setMenuMode])

  return (
    <div className={`${styles.container} ${show(currentMode)}`}>
      <div className={styles.panel}>
        <TabPanel selectedKey={localMode}>
          <TabContent key={Mode.Emotion}>
            <EmotionControls className="p-24" />
          </TabContent>
          <TabContent key={Mode.Face}>
            <FaceControls className="p-24" />
          </TabContent>
          <TabContent key={Mode.Pose}>
            <PoseListControls />
          </TabContent>
          <TabContent key={Mode.Model}>
            <ModelControls />
          </TabContent>
          <TabContent key={Mode.Option}>
            <OptionControls className="p-24" />
          </TabContent>
        </TabPanel>
      </div>
    </div>
  )
}
export default Panel
