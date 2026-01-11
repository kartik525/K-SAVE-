import { updateDefaultAccount } from '@/actions/account'
import { getCurrentBudget } from '@/actions/budget'
import { getAccounts, getDashboardData } from '@/actions/dashboard'
import { useFetch } from '@/app/hooks/useFetch'
import AccountCard from '@/components/AccountCard'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'
import BudgetProgress from './_components/BudgetProgress'
import { BarLoader } from 'react-spinners'
import DashboardOverview from './_components/DashboardOverview'

const DashboardPage = async () => {
    const { success, data: accounts }: any = await getAccounts()
    console.log(accounts, "accounts");

    const defaultAccount = accounts.find((acc: any) => acc.isDefault);
    let budgetData: any = null;
    if (defaultAccount) {
        console.log(defaultAccount?.id, "def acc");
        let id = defaultAccount?.id || ""
        // await updateDefaultAccount({ id });

        budgetData = await getCurrentBudget({ accountId: id });
        console.log(budgetData, "budgetData");
    }

    const { success: success2, data: transactions } = await getDashboardData()


    return (
        <div>
            {/* <h1 className='px-5'> */}
            {defaultAccount && (
                <BudgetProgress initialBudget={budgetData?.budget} currentExpenses={budgetData?.expenses || 0} />
            )}
            <Suspense fallback={<BarLoader className='mt-4' color="#6c47ff" width={'100%'} />}>
                <DashboardOverview
                    transactions={transactions}
                    accounts={accounts}
                />

            </Suspense>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <CreateAccountDrawer>
                    <Card className=' cursor-pointer hover:shadow-md transition-shadow border-dashed h-52'>
                        <CardContent className='flex flex-col items-center justify-center space-y-2 pt-5 text-muted-foreground h-full'>
                            <Plus className=' h-10 w-10 mb-2' />
                            <p className='text-sm font-semibold'>Add New Account</p>
                        </CardContent>
                    </Card>
                </CreateAccountDrawer>
                {/* <div className=''> */}
                {accounts.length > 0 && accounts.map((account: any) => {
                    return <Link key={account.id} href={`/account/${account.id}`}><AccountCard account={account} /></Link>
                })}
                {/* </div> */}
            </div>
            {/* </h1> */}
        </div>

    )
}

export default DashboardPage