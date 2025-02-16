import Mail from './mail'
import React from 'react'

const MailDashboard = () => {
  return (
    <Mail
      defaultCollapsed={false}
      defaultLayout={[20, 32, 48]}
      navCollapsedSize={15}
    />
  )
}

export default MailDashboard