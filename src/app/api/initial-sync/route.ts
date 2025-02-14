import { NextRequest, NextResponse } from "next/server";

import { Account } from "~/lib/account";
import { db } from "~/server/db";

export const POST = async(req: NextRequest) => {
    try {
        const body = await req.json();
        console.log("Received payload:", body);

        if(!body.accountId || !body.userId){
            return NextResponse.json({ error: "Missing accountId or userId" }, { status: 400 });
        }

        console.log(`Fetching account from DB for accountId: ${body.accountId}`);
        const dbAccount = await db.account.findUnique({
            where: { id: body.accountId, userId: body.userId }
        });

        if(!dbAccount){
            console.error("Account not found in DB");
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        console.log("Starting initial sync...");
        const account = new Account(dbAccount.accessToken);
        const response = await account.performInitialSync();

        if(!response){
            console.error("Error while performing initial sync");
            return NextResponse.json({ error: "Error while performing initial sync" }, { status: 500 });
        }

        console.log("Emails synced:", response.emails.length);
        console.log("Delta Token:", response.deltaToken);

        await db.account.update({
            where: { id: body.accountId },
            data: { nextDeltaToken: response.deltaToken }
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Unhandled error in initial-sync:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
