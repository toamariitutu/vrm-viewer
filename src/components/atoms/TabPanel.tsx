import React from 'react'

type Props = {
  selectedKey: string | number
  className?: string
}

const TabPanel: React.FunctionComponent<Props> = ({
  children,
  selectedKey,
}) => {
  return (
    <>
      {(children as React.ReactElement[]).find(
        child => child.key === selectedKey,
      )}
    </>
  )
}
export default TabPanel
