import React, { useContext } from 'react'
import styles from 'scss/modules/loader.module.scss'
import { LoadingContext } from 'contexts'

const Loader = () => {
  const [loadingStatus] = useContext(LoadingContext)
  return (
    <div
      className={`${styles.overlay} ${loadingStatus.isLoading ? 'active' : ''}`}
    >
      <div className={styles.loader}>
        <p>Loading...</p>
        {loadingStatus.progress != null && (
          <p>{`${loadingStatus.progress} %`}</p>
        )}
      </div>
    </div>
  )
}
export default Loader
