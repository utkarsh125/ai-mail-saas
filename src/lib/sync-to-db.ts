import { EmailAddress, EmailAttachment, EmailMessage } from "./types";

import { OramaClient } from "./orama";
import { db } from "~/server/db";

export async function syncEmailsToDatabase(
  emails: EmailMessage[],
  accountId: string,
) {
  // console.log("Attempting to sync emails to database. Count:", emails.length);

  //ORAMA DOC SEARCH FUNCTIONALITY
  const orama = new OramaClient(accountId)
  await orama.initialize()

  if (!emails.length) {
    // console.log("No emails to sync.");
    return;
  }

  try {
    // await Promise.all(
    //   emails.map((email, index) => upsertEmail(email, accountId, index)),
    // );

    for(const email of emails){
      await orama.insert({
        subject: email.subject,
        body: email.body ?? '',
        from: email.from.address,
        rawBody: email.body,
        to: email.to.map(to => to.address),
        sentAt: new Date(email.sentAt).toLocaleDateString(),
        threadId: email.threadId
      })
      await upsertEmail(email, accountId, 0)
    }

    // Verify stored emails
    const storedEmails = await db.email.findMany({});
    console.log("Final stored email count:", storedEmails.length);
  } catch (error) {
    console.error("Error while syncing emails:", error);
  }
}

// Upserting email
async function upsertEmail(
  email: EmailMessage,
  accountId: string,
  index: number,
) {
  console.log(`Upserting email ${index} | ID: ${email.id}`);
  console.log("Email sysLabels: ", email.sysLabels);

  try {
    if (!email.id) {
      console.error(`Skipping email due to missing ID.`);
      return;
    }

    if (!email.threadId) {
      console.warn(
        `Missing threadId for email ${email.id}, generating a default one.`,
      );
      email.threadId = `thread_${email.id}`;
    }

    if (!email.from || !email.from.address) {
      console.error(`Email ${email.id} has no sender address`);
      return;
    }

    // let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox';
    // if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
    //     emailLabelType = 'inbox';
    // } else if (email.sysLabels.includes('sent')) {
    //     emailLabelType = 'sent';
    // } else if (email.sysLabels.includes('draft')) {
    //     emailLabelType = 'draft';
    // }

    // Attempt to extract folder information from nativeProperties if provided
    const folderName =
      email.nativeProperties &&
      (email.nativeProperties["folderName"] || email.nativeProperties["Folder"])
        ? String(
            email.nativeProperties["folderName"] ||
              email.nativeProperties["Folder"],
          ).toLowerCase()
        : "";

    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";

    if (folderName === "drafts" || email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    } else if (
      folderName === "sent items" ||
      folderName === "sent" ||
      email.sysLabels.includes("sent")
    ) {
      emailLabelType = "sent";
    } else if (
      folderName === "inbox" ||
      email.sysLabels.includes("inbox") ||
      email.sysLabels.includes("important")
    ) {
      emailLabelType = "inbox";
    }

    // Upserting all email addresses
    const addressesToUpsert = new Map();
    [
      email.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ].forEach((address) => {
      addressesToUpsert.set(address.address, address);
    });

    const upsertedAddresses = await Promise.all(
      [...addressesToUpsert.values()].map((address) =>
        upsertEmailAddress(address, accountId),
      ),
    );

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address]),
    );

    const fromAddress = addressMap.get(email.from.address);
    if (!fromAddress) {
      console.error(`Failed to upsert sender address for email ${email.id}`);
      return;
    }

    console.log(`Upserting thread with ID: ${email.threadId}`);

    // Upsert Thread
    // const thread = await db.thread.upsert({
    //   where: { id: email.threadId },
    //   update: {
    //     subject: email.subject,
    //     accountId,
    //     lastMessageDate: new Date(email.sentAt),
    //     done: false,
    //   },
    //   create: {
    //     id: email.threadId,
    //     accountId,
    //     subject: email.subject,
    //     done: false,
    //     draftStatus: emailLabelType === "draft",
    //     inboxStatus: emailLabelType === "inbox",
    //     sentStatus: emailLabelType === "sent",
    //     lastMessageDate: new Date(email.sentAt),
    //   },
    // });

    // Updated code in sync-to-db.ts:
    const thread = await db.thread.upsert({
        where: { id: email.threadId },
        update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        // **New lines:** update the thread statuses on every sync
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        },
        create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        lastMessageDate: new Date(email.sentAt),
        },
    });
  

    console.log(`Upserted thread ID: ${thread.id}`);

    // Ensure only valid email addresses are included in `connect`
    const filterValidAddresses = (addresses: EmailAddress[]) =>
      addresses
        .map((a) => addressMap.get(a.address))
        .filter(Boolean)
        .map((a) => ({ id: a!.id }));

    // Upsert Email
    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        fromId: fromAddress.id,
        to: { set: filterValidAddresses(email.to) },
        cc: { set: filterValidAddresses(email.cc) },
        bcc: { set: filterValidAddresses(email.bcc) },
        replyTo: { set: filterValidAddresses(email.replyTo) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        emailLabel: emailLabelType,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        fromId: fromAddress.id,
        to: { connect: filterValidAddresses(email.to) },
        cc: { connect: filterValidAddresses(email.cc) },
        bcc: { connect: filterValidAddresses(email.bcc) },
        replyTo: { connect: filterValidAddresses(email.replyTo) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
      },
    });

    console.log(`Email ${email.id} stored successfully`);
  } catch (error) {
    console.error(`Error in upserting email ${email.id}:`, error);
  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  try {
    if (!address.address) {
      console.error("Skipping email address upsert due to missing address.");
      return null;
    }

    return await db.emailAddress.upsert({
      where: { accountId_address: { accountId, address: address.address } },
      update: { name: address.name, raw: address.raw },
      create: {
        accountId,
        address: address.address,
        name: address.name,
        raw: address.raw,
      },
    });
  } catch (error) {
    console.error("Failed to upsert email address:", error);
    return null;
  }
}
