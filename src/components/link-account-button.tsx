"use client"

import { Button } from './ui/button'
import React from 'react'
import { getAurinkoAuthURL } from '~/lib/aurinko'

const LinkAccountButton = () => {
  return (
    <Button onClick={async()  => {
        const authUrl = await getAurinkoAuthURL('Office365')
        // console.log(authUrl)
        window.location.href = authUrl // allow the browser to open the link
    }}>
        Link Account
    </Button>
  )
}

export default LinkAccountButton