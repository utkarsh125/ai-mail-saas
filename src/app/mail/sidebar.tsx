"use client"

import { File, Inbox, Send } from 'lucide-react'

import { Nav } from './nav'
import React from 'react'
import { api } from '~/trpc/react'
import { useLocalStorage } from 'usehooks-ts'

type Props = {
  isCollapsed: boolean
}

const Sidebar = ({ isCollapsed }: Props) => {
  const [accountId] = useLocalStorage('accountId', '')
  const [tab] = useLocalStorage('normalhuman-tab', 'inbox')

  const { data: inboxThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: 'inbox'
  });

  const { data: draftsThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: 'drafts'
  });

  const { data: sentThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: 'sent'
  });

  return (
    <Nav
      isCollapsed={isCollapsed}
      links={[
        {
          title: 'Inbox',
          label: inboxThreads?.toString() || "0",
          icon: Inbox,
          variant: tab === 'inbox' ? 'default' : 'ghost'
        },
        {
          title: 'Draft',
          label: draftsThreads?.toString() || "0",
          icon: File,
          variant: tab === 'drafts' ? 'default' : 'ghost'
        },
        {
          title: 'Sent',
          label: sentThreads?.toString() || "0",
          icon: Send,
          variant: tab === 'sent' ? 'default' : 'ghost'
        }
      ]}
    />
  );
}

export default Sidebar;
