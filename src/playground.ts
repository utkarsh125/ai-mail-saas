import {create, insert, search, type AnyOrama } from '@orama/orama'
import { db } from './server/db'
import { OramaClient } from './lib/orama'


const orama = new OramaClient('98252')

await orama.initialize()

// const emails = await db.email.findMany({
//     select:{
//         subject:true,
//         body:true,
//         from:true,
//         to:true,
//         sentAt:true,
//         threadId:true,
//     }
// })

// for(const email of emails){
//     console.log(email.subject)
//     await orama.insert({
//         subject: email.subject,
//         body: email.body ?? '',
//         from: email.from.address,
//         to: email.to.map(to => to.address),
//         sentAt: email.sentAt.toLocaleDateString(),
//         threadId: email.threadId
//     })
// }

const searchResults = await orama.search({
    term: 'fucking',
})
console.log(searchResults.hits)
for(const hit of searchResults.hits){
    console.log(hit.document.subject)
}