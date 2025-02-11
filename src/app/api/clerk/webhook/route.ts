// api/clerk/webhook ---> folder based routing
// This file will allow users to hit the NextJS app at the above route.

import { db } from "~/server/db";

export const POST = async(req: Request) => {
    const { data } = await req.json();

    //DEBUG LOG
    // console.log('Clerk Webhook received', data);

    // Check the log after sending the payload from Clerk and select the required
    // params to work with
    const emailAddress = data.email_addresses[0].email_address
    const firstName = data.first_name
    const lastName = data.last_name
    const imageUrl = data.image_url
    const id = data.id


    await db.user.create({
        data:{
            id: id,
            emailAddress: emailAddress,
            firstName: firstName,
            lastName: lastName,
            imageUrl: imageUrl,
        }
    })

    console.log('User Created');

    return new Response('Webhook received', {status: 200})
}