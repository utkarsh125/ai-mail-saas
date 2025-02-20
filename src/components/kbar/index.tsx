'use client'

import {Action, KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarResults, KBarSearch} from 'kbar'

import { RenderResult } from './render-results'
import useAccountSwitching from './use-account-switching'
import { useLocalStorage } from 'usehooks-ts'
import useThemeSwitching from './use-theme-switching'

export default function KBar({children} : {children: React.ReactNode}) {


    const [_, setTab] = useLocalStorage('normalhuman-tab', 'inbox')
    const [done, setDone] = useLocalStorage('normalhuman-done', false)
    

    //actions for KBar
    const actions: Action[] = [
        {
            id: 'inboxAction',
            name: 'Inbox',
            shortcut: ['g', 'i'],
            keywords: 'inbox',
            section: 'Navigation',
            subtitle: 'View your inbox',
            perform: () => {
                setTab('inbox')
                // console.log('Inbox')
            }
        },
        {
            id: 'draftAction',
            name: 'Draft',
            shortcut: ['g', 'd'],
            keywords: "draft",
            section: 'Navigation',
            subtitle: 'View your draft',
            perform: () => {
                setTab('draft')
                // console.log('Draft')
            }
        },
        {
            id: 'sentAction',
            name: 'Sent',
            shortcut: ['g', 's'],
            keywords: "sent",
            section: 'Navigation',
            subtitle: 'View sent messages',
            perform: () => {
                setTab('sent')
                // console.log('Sent')
            }
        },
        {
            id: 'pendingAction',
            name: 'See done',
            shortcut: ['g', 'u'],
            keywords: "done",
            section: 'Navigation',
            subtitle: 'View the done mails',
            perform: () => {
                // console.log('Done')
                setDone(true)
            }
        },

    ]

    return <KBarProvider actions={actions}>
        <ActualComponent>
            {children}
        </ActualComponent>
    </KBarProvider>
}


const ActualComponent = ({children} : {children: React.ReactNode}) => {

    //Custom Hooks
    
    useThemeSwitching()
    useAccountSwitching()
    return <>
        <KBarPortal>

            <KBarPositioner className='fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar-hide !p-0 z-[999]'>
                <KBarAnimator className='max-w-[600px] !mt-64 w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg border dark:border-gray-700 overflow-hidden relative !-translate-y-12'>
                    <div className='bg-white dark:bg-gray-800'>
                        <div className='border-x-0 border-b-2 dark:border-gray-700'>
                            <KBarSearch className='py-4 px-6 text-lg w-full dark:bg-gray-800 outline-none border-none focus:outline-none focus:ring-0 focus:ring-offset-0'/>
                        </div>
                        <RenderResult />
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>

        {children}
    </>
}