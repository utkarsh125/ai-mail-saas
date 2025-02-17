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
  // console.log("🔍 Stored accountId from localStorage:", accountId);

  const [tab] = useLocalStorage('normalhuman-tab', 'inbox')
  // console.log("🔍 Current tab value:", tab);

  const { data: inboxThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: 'inbox'
  });
  // console.log("🔍 inboxThreads data:", inboxThreads);

  const { data: draftsThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: 'drafts'
  });
  // console.log("🔍 draftsThreads data:", draftsThreads);

  const { data: sentThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: 'sent'
  });
  // console.log("🔍 sentThreads data:", sentThreads);

  return (
    <Nav isCollapsed={isCollapsed}
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
          variant: tab === 'draft' ? 'default' : 'ghost'
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
