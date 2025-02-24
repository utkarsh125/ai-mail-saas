import { createTRPCRouter, privateProcedure } from "../trpc";

import { Account } from "~/lib/account";
import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import { emailAddressSchema } from "~/lib/types";
import { z } from "zod";

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  // console.log(
  //   "[authorizeAccountAccess] Checking access for accountId:",
  //   accountId,
  //   "and userId:",
  //   userId,
  // );

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      token: true,
    },
  });

  if (!account) {
    console.error(
      "[authorizeAccountAccess] Account not found for user:",
      userId,
      "with accountId:",
      accountId,
    );
    throw new Error("Account not found");
  }

  // console.log("[authorizeAccountAccess] Account found:", account);
  // console.log("[authorizeAccountAccess] Returning account ID:", account.id);
  return account;
};

export const accountRouter = createTRPCRouter({
  // Grouping endpoints for accounts.
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    console.log(
      "[accountRouter.getAccounts] Starting getAccounts query for user:",
      ctx.auth.userId,
    );

    const accounts = await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    });

    // console.log("[accountRouter.getAccounts] Accounts retrieved:", accounts);
    // console.log(
    //   "[accountRouter.getAccounts] Number of accounts found:",
    //   accounts.length,
    // );

    return accounts;
  }),

  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // console.log("[accountRouter.getNumThreads] Starting getNumThreads...");
      // console.log("[accountRouter.getNumThreads] Received input:", input);
      // console.log(
      //   "[accountRouter.getNumThreads] Authenticated userID:",
      //   ctx.auth.userId,
      // );

      // Authorize access to the account.
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      // console.log(
      //   "[accountRouter.getNumThreads] Building filter for tab:",
      //   input.tab,
      // );
      let filter: Prisma.ThreadWhereInput = {};

      if (input.tab === "inbox") {
        filter.inboxStatus = true;
        console.log("[accountRouter.getNumThreads] Filter set for inbox");
      }
      if (input.tab === "drafts") {
        filter.draftStatus = true;
        console.log("[accountRouter.getNumThreads] Filter set for draft");
      }
      if (input.tab === "sent") {
        filter.sentStatus = true;
        console.log("[accountRouter.getNumThreads] Filter set for sent");
      }

      // console.log("[accountRouter.getNumThreads] Final filter object:", filter);

      // (Optional) Uncomment to see all threads for this account:
      /*
      const allThreads = await ctx.db.thread.findMany({
        where: { accountId: account.id },
        select: {
          id: true,
          inboxStatus: true,
          draftStatus: true,
          sentStatus: true,
        },
      });
      console.log("[accountRouter.getNumThreads] All threads for this account:", allThreads);
      */

      const count = await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });

      // console.log(
      //   "[accountRouter.getNumThreads] Thread count for account:",
      //   account.id,
      //   "is",
      //   count,
      // );

      return count;
    }),

  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.token)
      acc.syncEmails().catch(console.error)

      let filter: Prisma.ThreadWhereInput = {};

      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }

      filter.done = {
        equals: input.done,
      };

      const threads = await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
      return threads;
    }),
  getSuggestions: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: account.id,
        },
        select: {
          address: true,
          name: true,
        },
      });
    }),

  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
        },
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              from: true,
              to: true,
              cc: true,
              sentAt: true,
              subject: true,
              bcc: true,
              internetMessageId: true, //this is needed thread handling via Aurinko
            },
          },
        },
      });
      if(!thread || thread.emails.length === 0){
        throw new Error("Thread not found");
      }

      const lastExternalEmail = thread.emails.reverse().find(email => email.from.address !== account.emailAddress)
      if(!lastExternalEmail) throw new Error('No external email found')

      return {
        subject: lastExternalEmail.subject,
        to: [lastExternalEmail.from, ...lastExternalEmail.to.filter(to => to.address !== account.emailAddress)],
        cc: lastExternalEmail.cc.filter(cc => cc.address !== account.emailAddress),
        from: {name: account.name, address: account.emailAddress},
        id: lastExternalEmail.internetMessageId
      }
    }),

    sendEmail: privateProcedure.input(z.object({
      accountId: z.string(),
      body: z.string(),
      subject: z.string(),
      from: emailAddressSchema,
      cc: z.array(emailAddressSchema).optional(),
      bcc: z.array(emailAddressSchema).optional(),
      to: z.array(emailAddressSchema),

      replyTo: emailAddressSchema,
      inReplyTo: z.string().optional(),
      threadId: z.string().optional(),
    })).mutation(async({ ctx, input}) => {
        const account = await authorizeAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.token)
        await acc.sendEmail({
          from: input.from,
          subject: input.subject,
          body: input.body,
          inReplyTo: input.inReplyTo,
          to: input.to,
          cc: input.cc,
          bcc: input.bcc,
          replyTo: input.replyTo,
          threadId: input.threadId
        })

    })
});
