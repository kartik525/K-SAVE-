"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RechartsDevtools } from '@recharts/devtools';
import { formatDate } from 'date-fns';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { format } from 'path';
import React from 'react'
import { Cell, Legend, Pie, PieChart } from 'recharts';

const RADIAN = Math.PI / 180;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
        return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
            {`${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
    );
};

const DashboardOverview = ({ accounts, transactions }: { accounts: any, transactions: any }) => {
    const [accountId, setAccountId] = React.useState(accounts.find((acc: any) => acc.isDefault)?.id || accounts[0]?.id);
    const filteredTransactions = transactions.filter((t: any) => { return t.accountId === accountId })

    const sortedTransactions: any = filteredTransactions.sort((a: any, b: any) => { return new Date(b.date).getTime() - new Date(a.date).getTime() }).slice(0, 5)
    console.log(sortedTransactions, "transs");

    const currentDate = new Date()
    const currentMonthExpenses = filteredTransactions.filter((t: any) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentDate.getMonth() && transactionDate.getFullYear() === currentDate.getFullYear();
    })

    const expensesByCategory = currentMonthExpenses?.reduce((acc: any, t: any) => {
        if (acc[t.category]) {
            acc[t.category] += Number(t.amount)
        } else {
            acc[t.category] = 10
        }
        return acc
    }, {})
    console.log((expensesByCategory), "exx");


    const pieChartData = Object.entries(expensesByCategory).map(([category, amount]: any) => {
        return {
            name: category,
            value: amount
        }
    })
    console.log(pieChartData, "piechart");



    return (
        <div className='grid gap-4 md:grid-cols-2 my-4'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                    <CardTitle className='text-base font-normal'>Recent Transactions</CardTitle>
                    <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder={accounts.find((acc: any) => acc.isDefault)?.name || accounts[0]?.name} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc: any) => { return <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem> })}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div>
                        {sortedTransactions?.length == 0 ?
                            <>
                                <p>
                                    No recent transactions found</p></>
                            :
                            <>{
                                sortedTransactions?.map((t: any) => {
                                    return (
                                        <div key={t.id} className='flex items-center justify-between'>
                                            <div className='space-y-1'>
                                                <p className='text-sm font-medium leading-zone'>
                                                    {t.description || 'untitled Transaction'}
                                                </p>
                                                <p className='text-sm text-muted-foreground'>
                                                    {formatDate(new Date(t.date), 'PP')}
                                                </p>

                                            </div>
                                            <div className=' flex items-center gap-2'>
                                                <div className={cn(
                                                    "flex items-center",
                                                    t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'
                                                )}>
                                                    {t.type === 'EXPENSE' ? (<ArrowDownRight className='mr-1 h-4 w-4' />) : (<ArrowUpRight className=' mr-1 h-4 w-4' />)}
                                                    ${t.amount}

                                                </div>

                                            </div>

                                        </div>)
                                }
                                )
                            }</>

                        }
                    </div>
                </CardContent>


            </Card>


            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                    <CardTitle className='text-base font-normal'>Monthly Expenses Breakdown</CardTitle>
                    {/* <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder={accounts.find((acc: any) => acc.isDefault)?.name || accounts[0]?.name} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc: any) => { return <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem> })}
                        </SelectContent>
                    </Select> */}
                </CardHeader>
                <CardContent>
                    <div>
                        {pieChartData?.length == 0 ?
                            <>
                                <p>
                                    No Expenses this Month</p></>
                            :
                            <>
                                <PieChart width={730} height={250} responsive>
                                    <Pie
                                        data={pieChartData}
                                        labelLine={false}
                                        label={(label: any) => `${label.name} : ${label.value}`}
                                        fill="#8884d8"
                                        dataKey="value"
                                        isAnimationActive={true}

                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <RechartsDevtools />
                                </PieChart></>

                        }
                    </div>
                </CardContent>


            </Card>
        </div>
    )
}

export default DashboardOverview