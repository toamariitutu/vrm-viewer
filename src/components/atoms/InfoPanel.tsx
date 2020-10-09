import React, { useContext, useCallback, useEffect } from 'react'
import { VRMSchema } from '@pixiv/three-vrm'
import IconButton from 'components/atoms/IconButton'
import styles from 'scss/modules/infoPanel.module.scss'
import { VrmManagerContext, InfoPanelContext, MenuModeContext } from 'contexts'
import { Mode } from 'components/molecules/Menu'
import infoIcon from 'assets/images/icon_info.svg'

type Dict<T extends string> = {
  [key in T]: string
} & { ''?: '' }

const metaAllowedUserNameDict: Dict<VRMSchema.MetaAllowedUserName> = {
  [VRMSchema.MetaAllowedUserName.Everyone]: '誰でも可',
  [VRMSchema.MetaAllowedUserName.ExplicitlyLicensedPerson]:
    '明示的にライセンスされた者のみ可',
  [VRMSchema.MetaAllowedUserName.OnlyAuthor]: '著作者のみ可',
}
const metaUssageNameDict: Dict<VRMSchema.MetaUssageName> = {
  [VRMSchema.MetaUssageName.Allow]: '○',
  [VRMSchema.MetaUssageName.Disallow]: '×',
}
const metaLicenseNameDict: Dict<VRMSchema.MetaLicenseName> = {
  [VRMSchema.MetaLicenseName.Cc0]: '著作権放棄',
  [VRMSchema.MetaLicenseName.CcBy]: 'CC BYライセンス',
  [VRMSchema.MetaLicenseName.CcByNc]: 'CC BY NCライセンス',
  [VRMSchema.MetaLicenseName.CcByNd]: 'CC BY NDライセンス',
  [VRMSchema.MetaLicenseName.CcByNcNd]: 'CC BY NC NDライセンス',
  [VRMSchema.MetaLicenseName.CcBySa]: 'CC BY SAライセンス',
  [VRMSchema.MetaLicenseName.CcByNcSa]: 'CC BY NC SAライセンス',
  [VRMSchema.MetaLicenseName.RedistributionProhibited]: '再配布禁止',
  [VRMSchema.MetaLicenseName.Other]: 'その他',
}

const BLANK_VAL = '未設定'

const InfoPanel = () => {
  const [vrmManager] = useContext(VrmManagerContext)
  const [shown, setShown] = useContext(InfoPanelContext)
  const [currentMode, setMenuMode] = useContext(MenuModeContext)
  const meta = vrmManager?.metaInfo || {}

  useEffect(() => {
    if (currentMode !== Mode.Neutral) {
      setShown(false)
    }
  }, [currentMode, setShown])

  const handleClickIcon = useCallback(() => {
    setShown(!shown)
    setMenuMode(Mode.Neutral)
  }, [setShown, shown, setMenuMode])
  return (
    <div className={styles.container}>
      <IconButton
        icon={infoIcon}
        label="info"
        className={styles.icon}
        onClick={handleClickIcon}
      />
      <div id="info-panel" className={`${styles.panel} ${shown ? 'show' : ''}`}>
        <dl>
          <div className={styles.row}>
            <dt className={styles.label}>名前</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.title || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>バージョン</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.version || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>著作者</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.author || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>連絡先情報</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.contactInformation! || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>リファレンス</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.reference || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>アバター利用</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={
                  metaAllowedUserNameDict[meta.allowedUserName || ''] ||
                  BLANK_VAL
                }
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>商用利用</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={
                  metaUssageNameDict[meta.commercialUssageName || ''] ||
                  BLANK_VAL
                }
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>暴力表現</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={
                  metaUssageNameDict[meta.violentUssageName || ''] || BLANK_VAL
                }
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>性的表現</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={
                  metaUssageNameDict[meta.sexualUssageName || ''] || BLANK_VAL
                }
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>その他の許諾条件</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.otherPermissionUrl || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>ライセンスタイプ</dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={metaLicenseNameDict[meta.licenseName || ''] || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={`${styles.label} auto-width`}>
              その他のライセンス条件
            </dt>
            <dd className={styles.value}>
              <input
                type="text"
                value={meta.otherLicenseUrl || BLANK_VAL}
                readOnly={true}
                className={styles.readonly}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
export default InfoPanel
