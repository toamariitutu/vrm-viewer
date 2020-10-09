import React, { useCallback, useContext } from 'react'
import { VRMSchema } from '@pixiv/three-vrm'
import Toggle from 'components/atoms/Toggle'
import {
  LookAtCameraContext,
  AutoBlinkContext,
  BlendShapeContext,
} from 'contexts'
import Slider from 'components/atoms/Slider'

type Props = {
  className?: string
}

const FaceControls = ({ className }: Props) => {
  const [lookAtCamera, setLookAtCamera] = useContext(LookAtCameraContext)
  const [autoBlink, setAutoBlink] = useContext(AutoBlinkContext)
  const [blendShapeMap, setBlendShape] = useContext(BlendShapeContext)

  const handleChangeLookAtCamera = useCallback(
    (bool: boolean) => {
      setLookAtCamera(bool)
    },
    [setLookAtCamera],
  )

  const handleChangeAutoBlink = useCallback(
    (bool: boolean) => {
      setAutoBlink(bool)
    },
    [setAutoBlink],
  )

  const handleChangeBlendShapeSlider = useCallback(
    (name: VRMSchema.BlendShapePresetName) => (val: string) => {
      const weight = Number(val)
      setBlendShape(name, weight)
    },
    [setBlendShape],
  )
  return (
    <div className={className || ''}>
      <div className="form-group form-group--row">
        <p className="form-group__label">視線追従：</p>
        <div className="form-group__control">
          <Toggle
            name="lookAtCamera"
            checked={lookAtCamera}
            onChange={handleChangeLookAtCamera}
          />
        </div>
      </div>
      <div className="form-group form-group--row">
        <p className="form-group__label">自動まばたき：</p>
        <div className="form-group__control">
          <Toggle
            name="autoBlink"
            checked={autoBlink}
            onChange={handleChangeAutoBlink}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          Blink：{Math.round(blendShapeMap.blink! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.blink!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.Blink,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          Blink R：{Math.round(blendShapeMap.blink_r! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.blink_r!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.BlinkR,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          Blink L：{Math.round(blendShapeMap.blink_l! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.blink_l!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.BlinkL,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          A：{Math.round(blendShapeMap.a! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.a!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.A,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          I：{Math.round(blendShapeMap.i! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.i!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.I,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          U：{Math.round(blendShapeMap.u! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.u!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.U,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          E：{Math.round(blendShapeMap.e! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.e!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.E,
            )}
          />
        </div>
      </div>
      <div className="form-group">
        <p className="form-group__label">
          O：{Math.round(blendShapeMap.o! * 100)}
        </p>
        <div className="form-group__control">
          <Slider
            value={blendShapeMap.o!}
            max={1}
            min={0}
            step={0.01}
            onChange={handleChangeBlendShapeSlider(
              VRMSchema.BlendShapePresetName.O,
            )}
          />
        </div>
      </div>
    </div>
  )
}
export default FaceControls
