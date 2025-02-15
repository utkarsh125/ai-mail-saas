import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";

import axios from "axios";

export class Account{
    private token: string;

    constructor(token: string){
        this.token = token;
    }

    // private async startSync(){
    //     const response = await axios.post<SyncResponse>(`https://api.aurinko.io/v1/email/sync`, {
    //         headers:{
    //             Authorization: `Bearer ${this.token}`,

    //         },
    //         params: {
    //             dayWithin: 2,
    //             bodyType: 'html'
    //         }
    //     })
    //     return response.data
    // }

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

    // async performInitialSync(){
    //     try{
    //         //start the syncing process
    //         let syncResponse = await this.startSync();
    //         while(!syncResponse.ready){
    //             await new Promise(resolve => setTimeout(resolve, 1000))
    //             syncResponse = await this.startSync();
    //         }

    //         let storedDeltaToken: string = syncResponse.syncUpdatedToken;
    //         let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken});

    //         if(updatedResponse.nextDeltaToken){
    //             //sync the next deltaToken
    //             storedDeltaToken = updatedResponse.nextDeltaToken;
    //         }

    //         let allEmails : EmailMessage[] = updatedResponse.records;

    //         //fetch all pages if there are more
    //         while(updatedResponse.nextPageToken){
    //             updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken})
    //             allEmails = allEmails.concat(updatedResponse.records)

    //             if(updatedResponse.nextDeltaToken){
    //                 //sync has ended
    //                 storedDeltaToken = updatedResponse.nextDeltaToken;
    //             }
    //         }

    //         console.log('Initial sync completed, we have synced:', allEmails.length, ' emails')

    //         // await this.getUpdatedEmails({deltaToken: storedDeltaToken})

    //         return {
    //             emails: allEmails,
    //             deltaToken: storedDeltaToken
    //         }
    //     }catch(error){

    //         if (axios.isAxiosError(error)) {
    //             console.error('Error during sync:', JSON.stringify(error.response?.data, null, 2));
    //         } else {
    //             console.error('Error during sync:', error);
    //         }
    //     }
    // }

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

    // async performInitialSync() {
    //     try {
    //         console.log("🟡 Starting sync process...");
    
    //         let syncResponse = await this.startSync();
    //         console.log("🟢 Initial sync response:", syncResponse);
    
    //         while (!syncResponse.ready) {
    //             console.log("🔄 Sync not ready, retrying in 1s...");
    //             await new Promise(resolve => setTimeout(resolve, 1000));
    //             syncResponse = await this.startSync();
    //             console.log("🔄 Sync response after retry:", syncResponse);
    //         }
    
    //         let storedDeltaToken: string = syncResponse.syncUpdatedToken;
    //         console.log("🟢 Stored delta token:", storedDeltaToken);
    
    //         let updatedResponse = await this.getUpdatedEmails({ deltaToken: storedDeltaToken });
    //         console.log("🟢 Updated response:", updatedResponse);
    
    //         if (updatedResponse.nextDeltaToken) {
    //             storedDeltaToken = updatedResponse.nextDeltaToken;
    //         }
    
    //         let allEmails: EmailMessage[] = updatedResponse.records;
    //         console.log("📩 Fetched emails count:", allEmails.length);
    
    //         while (updatedResponse.nextPageToken) {
    //             console.log("🔄 Fetching next page...");
    //             updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
    //             allEmails = allEmails.concat(updatedResponse.records);
    
    //             if (updatedResponse.nextDeltaToken) {
    //                 storedDeltaToken = updatedResponse.nextDeltaToken;
    //             }
    //         }
    
    //         console.log("✅ Final email count:", allEmails.length);
    
    //         return {
    //             emails: allEmails,
    //             deltaToken: storedDeltaToken
    //         };
    
    //     } catch (error: any) {
    //         console.error("❌ Error during sync:", error.response?.data || error);
    //         return null;
    //     }
    // }
    
    
}