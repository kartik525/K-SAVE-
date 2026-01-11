import { getAccountWithTransactions } from '@/actions/account'
import { parse } from 'path';
import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners';
import TransactionTable from '../_components/TransactionTable';
import AccountChart from '../_components/AccountChart';

const AccountPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const accountData = await getAccountWithTransactions(id);
    console.log(accountData, "accountData");
    const { transactions, ...account } = accountData;
    return (
        <div className='space-y-8 px-5 '>
            <div className='flex gap-4 items-center justify-between'>
                <div>
                    <h1 className=' text-5xl gradient-title font-bold capitalize'>{account.name}</h1>
                    <p className=' text-muted-foreground'>{account.type.charAt(0).toUpperCase() + account.type.slice(1).toLowerCase()} Account</p>
                </div>

                <div className='text-right pb-2'>
                    <div className='text-xl sm:text-2xl font-bold'>${parseFloat(account.balance).toFixed(2)}</div>
                    <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
                </div>
            </div>

            {/* Chart Section */}
            <Suspense fallback={<BarLoader className='mt-4' color="#6c47ff" width={'100%'} />}>
                <AccountChart transactions={transactions} />
            </Suspense>

            {/* Transaction Table */}
            <Suspense fallback={<BarLoader className='mt-4' color="#6c47ff" width={'100%'} />}>
                <TransactionTable transactions={transactions} />

            </Suspense>

        </div>
    )
}

export default AccountPage