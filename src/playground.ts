import {create, insert, search, type AnyOrama } from '@orama/orama'
import { db } from './server/db'
import { OramaClient } from './lib/orama'
import { turndown } from './lib/turndown'
import { getEmbeddings } from './lib/embedding'


const orama = new OramaClient('98252')//pass in the userId

// await orama.initialize()

// const emails = await db.email.findMany({
//     select:{
//         subject:true,
//         body:true,
//         from:true,
//         to:true,
//         sentAt:true,
//         threadId:true,
//         bodySnippet: true,
//     }
// })

// for(const email of emails){

//     // console.log("Email subject: ", email.subject);

//     //convert the body into markdown format
//     const body = turndown.turndown(email.body ?? email.bodySnippet ?? "")
//     const embeddings = await getEmbeddings(body);

//     console.log(embeddings.length)
//     await orama.insert({
//         subject: email.subject,
//         body: email.body ?? '',
//         rawBody: email.bodySnippet,
//         from: email.from.address,
//         to: email.to.map(to => to.address),
//         sentAt: email.sentAt.toLocaleDateString(),
//         threadId: email.threadId,
//         embeddings
//     })
// }



const searchResults = await orama.vectorSearch({
    term: 'google',
})
// console.log(searchResults.hits)
for(const hit of searchResults.hits){
    console.log(hit.document.subject)
}