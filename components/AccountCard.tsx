"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { updateDefaultAccount } from '@/actions/account'
import { toast } from 'sonner'
import { useFetch } from '@/app/hooks/useFetch'

const AccountCard = ({ account, key }: any) => {
    const { data: defaultAccountData, loading: defaultAccountLoading, error, fn: updateDefaultAccountFn } = useFetch(updateDefaultAccount);

    const handleDefaultAccountChange = async (e: any) => {
        e.preventDefault();

        if (account.isDefault) {
            toast.warning("This account is already the default account");
            return;
        }

        await updateDefaultAccountFn(account?.id);
    }

    useEffect(() => {
        if (defaultAccountData && !defaultAccountLoading) {
            toast.success("Default account updated successfully");
            // Refresh or re-fetch accounts after updating default account
            // This could be done by calling getAccounts again or using a state management solution
        }
    }, [defaultAccountData, defaultAccountLoading]);

    useEffect(() => {
        if (error) {
            toast.error(error?.message || "An error occurred");
        }
    }, [error]);
    return (
        <Card className=' cursor-pointer hover:shadow-md transition-shadow h-52 py-8'>
            <CardHeader className=' flex items-center justify-between'>
                <CardTitle className=' capitalize'>{account.name}</CardTitle>
                <Switch className='cursor-pointer' checked={account.isDefault} disabled={defaultAccountLoading} onClick={handleDefaultAccountChange} />
            </CardHeader>
            <CardContent>
                <div className=' text-xl font-bold'>
                    ${parseFloat(account.balance).toFixed(2)}
                </div>
                <p className=' text-sm text-muted-foreground'>
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1).toLowerCase()} Account
                </p>
            </CardContent>
            <CardFooter className='flex justify-between text-sm text-muted-foreground'>
                <div className='flex items-center'>
                    <ArrowUpIcon className=' h-4 w-4 mr-1 text-green-500' />
                    Income
                </div>
                <div className='flex items-center'>
                    <ArrowDownIcon className=' h-4 w-4 mr-1 text-red-500' />
                    Expense
                </div>
            </CardFooter>
        </Card>
    )
}

export default AccountCard