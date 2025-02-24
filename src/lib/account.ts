import { EmailAddress, EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";

import axios from "axios";
import { db } from "~/server/db";
import { syncEmailsToDatabase } from "./sync-to-db";

export class Account{
    private token: string;

    constructor(token: string){
        this.token = token;
    }

    private async startSync(){
        try {
            const response = await axios.post<SyncResponse>(
                `https://api.aurinko.io/v1/email/sync`,
                { dayWithin: 2, bodyType: 'html' }, // Moved to request body
                {
                    headers: { Authorization: `Bearer ${this.token}` },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Error in startSync:", error.response?.data || error.message);
            throw error;
        }
    }
    
    async getUpdatedEmails({deltaToken, pageToken} : {deltaToken?: string, pageToken?: string}){
        let params: Record<string, string> = {

        }

        if(deltaToken) params.deltaToken = deltaToken;
        if(pageToken) params.pageToken = pageToken;

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers:{
                Authorization: `Bearer ${this.token}`
            },
            params
        })
        return response.data;
    }



    async performInitialSync() {
        try {
            console.log("Starting sync process...");
            
            let syncResponse = await this.startSync();
            console.log("Initial sync response:", syncResponse);
    
            while (!syncResponse.ready) {
                console.log("Sync not ready, retrying in 1s...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                syncResponse = await this.startSync();
                console.log("Sync response after retry:", syncResponse);
            }
    
            let storedDeltaToken: string = syncResponse.syncUpdatedToken;
            console.log("Stored delta token:", storedDeltaToken);
    
            let updatedResponse = await this.getUpdatedEmails({ deltaToken: storedDeltaToken });
            console.log("Updated response:", updatedResponse);
    
            if (updatedResponse.nextDeltaToken) {
                storedDeltaToken = updatedResponse.nextDeltaToken;
            }
    
            let allEmails: EmailMessage[] = updatedResponse.records;
            console.log("Fetched emails count:", allEmails.length);
    
            while (updatedResponse.nextPageToken) {
                console.log("Fetching next page...");
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
                allEmails = allEmails.concat(updatedResponse.records);
    
                if (updatedResponse.nextDeltaToken) {
                    storedDeltaToken = updatedResponse.nextDeltaToken;
                }
            }
    
            console.log("Final email count:", allEmails.length);
    
            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            };
    
        } catch (error: any) {
            console.error("Error during sync:", error.response?.data || error);
            return null;
        }
    }

    async syncEmails(){
        const account = await db.account.findUnique({
            where: { token: this.token }
        })
        if(!account) throw new Error('Account not found');
        if(!account.nextDeltaToken) throw new Error('Account not ready for sync');

        let response = await this.getUpdatedEmails({
            deltaToken: account.nextDeltaToken
        })

        let storedDeltaToken = account.nextDeltaToken;
        let allEmails: EmailMessage[] = response.records

        if(response.nextDeltaToken){
            storedDeltaToken = response.nextDeltaToken
        }

        while(response.nextPageToken){
            response = await this.getUpdatedEmails({pageToken: response.nextDeltaToken})
            allEmails = allEmails.concat(response.records)
            if(response.nextDeltaToken){
                storedDeltaToken = response.nextDeltaToken
            }
        }

        try {
            syncEmailsToDatabase(allEmails, account.id)
        } catch (error) {
            console.error('Error during sync: ', error)
        }

        await db.account.update({
            where: {
                id: account.id
            },
            data: {
                nextDeltaToken: storedDeltaToken
            }
        })

        return {
            emails: allEmails,
            storedDeltaToken: storedDeltaToken
        }
    }


    async sendEmail({

        from,
        subject,
        body,
        inReplyTo,
        references,
        to,
        cc,
        bcc,
        replyTo,
        threadId

    }: {
        from: EmailAddress,
        subject: string,
        body: string,
        inReplyTo?: string,
        threadId?: string
        references?: string,
        to: EmailAddress[],
        cc?: EmailAddress[],
        bcc?: EmailAddress[],
        replyTo?: EmailAddress

    }) {

        try {
            const response = await axios.post('https://api.aurinko.io/v1/email/messages', {
                from,
                subject,
                body,
                inReplyTo,
                references,
                to,
                threadId,
                cc,
                bcc,
                replyTo: [replyTo]

            }, {
                params: {
                    returnIds: true
                },
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
            })
            console.log('Email Sent: ', response.data)
            return response.data
        } catch (error) {
            if(axios.isAxiosError(error)){
                console.log(`Error sending email: `, JSON.stringify(error.response?.data, null, 0));
            }else {
                console.error(`Error sending email: `, error);
            }
            throw error
        }
    }

}