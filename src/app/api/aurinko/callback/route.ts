// api/aurinko/callback

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccessToken, getAccountDetails } from "~/lib/aurinko";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { db } from "~/server/db";
import { waitUntil } from "@vercel/functions";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  // console.log('userId is ', userId)

  if (!userId)
    return NextResponse.json({
      message: "Unauthorized",
      status: 401,
    });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");

  if (status !== "success")
    return NextResponse.json(
      {
        message: "Failed to link account",
      },
      {
        status: 400,
      },
    );

  //get the code to exchange for access token
  const code = params.get("code");
  if (!code)
    return NextResponse.json(
      {
        message: "No code provided",
      },
      {
        status: 400,
      },
    );

  const token = await exchangeCodeForAccessToken(code);

  if (!token) {
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 400 },
    );
  }

  const accountDetails = await getAccountDetails(token.accessToken);
  //   console.log(accountDetails)

  // await db.account.upsert({
  //   where: {
  //     id: token.accountId.toString(),
  //   },
  //   update: {
  //     accessToken: { set: token.accessToken }, // Use `set()` to update unique fields
  //   },
  //   create: {
  //     id: token.accountId.toString(),
  //     userId,
  //     emailAddress: accountDetails.email,
  //     name: accountDetails.name,
  //     accessToken: token.accessToken,
  //   },
  // });
  
//   await db.account.upsert({
//     where: { id: token.accountId.toString() },
//     create: {
//         id: token.accountId.toString(),
//         userId,
//         token: token.accessToken,
//         provider: 'Aurinko',
//         emailAddress: accountDetails.email,
//         name: accountDetails.name
//     },
//     update: {
//         token: token.accessToken,
//     }
// })

  
const existingUser = await db.user.findUnique({
  where: { id: userId },
});

if (!existingUser) {
  console.log(`User with ID ${userId} does not exist. Creating a new user...`);

  await db.user.create({
      data: {
          id: userId,
          emailAddress: accountDetails.email,
          firstName: accountDetails.name.split(" ")[0] ?? "Unknown",
          lastName: accountDetails.name.split(" ").slice(1).join(" ") ?? "Unknown",
      },
  });
}

//Now that user exists, we can safely create or update the account
await db.account.upsert({
  where: { id: token.accountId.toString() },
  create: {
      id: token.accountId.toString(),
      userId, // Ensuring this exists in User table
      token: token.accessToken,
      provider: "Aurinko",
      emailAddress: accountDetails.email,
      name: accountDetails.name,
  },
  update: {
      token: token.accessToken,
  },
});


  //trigger initial-sync endpoint
  waitUntil(
    axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
      accountId: token.accountId.toString(),
      userId
    }).then(response => {
      console.log('Initial sync triggered')
    }).catch(error => {
      console.error('Failed to trigger initial sync', error)
    })
  )


  return NextResponse.redirect(new URL("/mail", req.url));
};
