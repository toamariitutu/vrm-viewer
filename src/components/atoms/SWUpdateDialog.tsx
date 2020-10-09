import React, { useState } from 'react'
import styles from 'scss/modules/swDialog.module.scss'

const SWUpdateDialog: React.FC<{ registration: ServiceWorkerRegistration }> = ({
  registration,
}) => {
  const [show] = useState(!!registration.waiting)
  const [reloading, setReloading] = useState(false)
  const handleUpdate = () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
    setReloading(true)
    window.location.reload()
  }

  return show ? (
    <div className={styles.panel}>
      <div className={styles.title}>
        <span>アップデートのお知らせ</span>
      </div>
      <div className={styles.body}>
        <span>新しいバージョンがリリースされました。</span>
        <br />
        <span>アップデートを実施してください。</span>
      </div>
      <div className={styles.button} onClick={handleUpdate}>
        <span>アップデート</span>
      </div>
      <div className={`${styles.overlay} ${reloading ? 'active' : ''}`}></div>
    </div>
  ) : (
    <></>
  )
}
export default SWUpdateDialog
