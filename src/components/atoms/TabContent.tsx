import React from 'react'

type Props = {
  key: string | number
  className?: string
}

const TabContent: React.FunctionComponent<Props> = ({
  children,
  className,
}) => <>{children}</>
export default TabContent
