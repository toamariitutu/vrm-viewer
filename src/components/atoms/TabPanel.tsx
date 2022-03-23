import React from 'react'

type Props = {
  selectedKey: string | number
  className?: string
}

const TabPanel: React.FunctionComponent<Props> = ({
  children,
  selectedKey,
  className,
}) => {
  return (
    <div className={className || ''}>
      {(children as React.ReactElement[]).find(
        child => child.key === selectedKey,
      )}
    </div>
  )
}
export default TabPanel
