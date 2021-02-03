import React, { useCallback, useContext } from 'react'
import { VRMSchema } from '@pixiv/three-vrm'
import Slider from 'components/atoms/Slider'
import { BlendShapeContext } from 'contexts'

type Props = {
  className?: string
}

const EmotionControls = ({ className }: Props) => {
  const [blendShapeMap, setBlendShape] = useContext(BlendShapeContext)

  const handleChangeBlendShapeSlider = useCallback(
    (name: VRMSchema.BlendShapePresetName) => (val: string) => {
      const weight = Number(val)
      setBlendShape(name, weight)
    },
    [setBlendShape],
  )
  return (
    <div className={`p-24 ${className || ''}`}>
      <div className="form-group">
        <p className="form-group__label">
          Joy：{Math.round(blendShapeMap.joy! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.joy!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.Joy,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          Angry：{Math.round(blendShapeMap.angry! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.angry!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.Angry,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          Sorrow：{Math.round(blendShapeMap.sorrow! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.sorrow!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.Sorrow,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          Fun：{Math.round(blendShapeMap.fun! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.fun!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.Fun,
            )}
          />
        </div>
      </div>
    </div>
  )
}
export default EmotionControls
