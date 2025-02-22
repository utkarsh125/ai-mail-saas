'use client'

import EmailEditor from './email-editor'
import React from 'react'
import { RouterOutputs } from '~/trpc/react'
import { api } from '~/trpc/react'
import useThreads from '~/hooks/use-threads'

const ReplyBox = () => {
  const { threadId, accountId } = useThreads()

  // Assuming you need the first thread's ID

  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "",
    accountId
  })

  if (!replyDetails) return null

  return <Component replyDetails={replyDetails} />
}

// Moved `Component` outside of `ReplyBox`
const Component = ({ replyDetails }: { replyDetails: RouterOutputs['account']['getReplyDetails'] }) => {

  const {threadId, accountId } = useThreads()
  const [subject, setSubject] = React.useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)

  const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })) || [])
  const [ccValues, setCcValues] = React.useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address ?? cc.name, value: cc.address })) || [])

  React.useEffect(() => {
    if(!threadId || !replyDetails) return
    if(!replyDetails.subject.startsWith("Re:")){
      setSubject(`Re: ${replyDetails.subject}`)
    }else{
      setSubject(replyDetails.subject)
    }

    setToValues(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })))
    setCcValues(replyDetails.cc.map(cc => ({ label: cc.address ?? cc.name, value: cc.address })))

  }, [threadId, replyDetails])


  const handleSend = async(value: string) =>{
    console.log(value)
  }


  return (
    <EmailEditor
     subject={subject}
     setSubject={setSubject}

     toValues={toValues}
     setToValues={setToValues}

     ccValues={ccValues}
     setCcValues={setCcValues}

     to={replyDetails.to.map(to => to.address)}
     handleSend= {handleSend}

     isSending={false}
     defaultToolbarExpanded={false}

    />
  )
}

export default ReplyBox
