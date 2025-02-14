"use server";

import { access } from "fs";
import { auth } from "@clerk/nextjs/server";
import axios from 'axios';

export const getAurinkoAuthURL = async (serviceType: 'Google' | 'Office365') => {
    const { userId } = await auth();
    if(!userId) throw new Error('Unauthorized');

    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All', //Permission that we need
        responseType: 'code',
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    })

    //when the below URL is called Aurinko will redirect to provider.
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
    
}

export const exchangeCodeForAccessToken = async(code: string) => {
    try {
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {}, {
            auth: {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string
            }
        })
        return response.data as{
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string
        }
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.error(error.response?.data)
        }
        console.error(error);
    }
}

export const getAccountDetails = async(accessToken: string) => {
    try {
        const response = await axios.get("https://api.aurinko.io/v1/account", {
            headers: {
                'Authorization' : `Bearer ${accessToken}`
            }
        })
        return response.data as {
            email: string,
            name: string
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error while fetching the account details: ", error.response?.data)
        }
        else {
            console.error("UnexpectedError while fetching the account details: ", error)
        }
        throw error;
    }
}