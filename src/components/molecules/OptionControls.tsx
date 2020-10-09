import React, { useCallback, useContext } from 'react'
import Toggle from 'components/atoms/Toggle'
import {
  ShowAxesContext,
  ShowGridContext,
  WaitingAnimationContext,
} from 'contexts'

type Props = {
  className?: string
}

const EyesControls = ({ className }: Props) => {
  const [waitingAnimation, toggleWaitingAnimation] = useContext(
    WaitingAnimationContext,
  )
  const [showGrid, toggleShowGrid] = useContext(ShowGridContext)
  const [showAxes, toggleShowAxes] = useContext(ShowAxesContext)

  const handleChangeWaitingAnimation = useCallback(
    (bool: boolean) => {
      toggleWaitingAnimation(bool)
    },
    [toggleWaitingAnimation],
  )
  const handleChangeShowGrid = useCallback(
    (bool: boolean) => {
      toggleShowGrid(bool)
    },
    [toggleShowGrid],
  )
  const handleChangeShowAxes = useCallback(
    (bool: boolean) => {
      toggleShowAxes(bool)
    },
    [toggleShowAxes],
  )
  return (
    <div className={className || ''}>
      <div className="form-group form-group--row">
        <p className="form-group__label">待機モーション：</p>
        <div className="form-group__control">
          <Toggle
            name="waitingAnimation"
            checked={waitingAnimation}
            onChange={handleChangeWaitingAnimation}
          />
        </div>
      </div>
      <div className="form-group form-group--row">
        <p className="form-group__label">グリッド表示：</p>
        <div className="form-group__control">
          <Toggle
            name="showGrid"
            checked={showGrid}
            onChange={handleChangeShowGrid}
          />
        </div>
      </div>
      <div className="form-group form-group--row">
        <p className="form-group__label">XYZ軸表示：</p>
        <div className="form-group__control">
          <Toggle
            name="showAxes"
            checked={showAxes}
            onChange={handleChangeShowAxes}
          />
        </div>
      </div>
    </div>
  )
}
export default EyesControls
