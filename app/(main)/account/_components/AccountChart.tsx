"use client"
import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import { endOfDay, formatDate, startOfDay, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';




const DATE_RANGES = {
    "7D": { days: 7, label: "Last 7 Days" },
    "1M": { days: 30, label: "Last Month" },
    "3M": { days: 90, label: "Last 3 Months" },
    "6M": { days: 180, label: "Last 6 Months" },
    "ALL": { days: null, label: "All Time" },
}
const AccountChart = ({ transactions }: { transactions: any }) => {
    const [dateRange, setDateRange] = React.useState<keyof typeof DATE_RANGES>("1M");
    const filteredData: any = useMemo(() => {
        const range = DATE_RANGES[dateRange];
        const now = new Date();
        const startDate = range?.days ?
            startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));
        const filteredTransactions = transactions?.filter((t: any) => {
            return new Date(t?.date) >= startDate && new Date(t?.date) <= endOfDay(now);
        })

        const grouped: object = filteredTransactions?.reduce((acc: any, transaction: any) => {
            const date = formatDate(new Date(transaction.date), 'MMM dd');
            if (!acc[date]) {
                acc[date] = { name: date, income: 0, expense: 0 };
            }
            if (transaction.type === "INCOME") {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expense += transaction.amount;
            }
            return acc;

        }, {})

        const final = Object.values(grouped).sort((a: any, b: any) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        }
        );
        return final;
    }, [transactions, dateRange])
    console.log(filteredData, "filteredData");


    const totals = useMemo(() => {
        return filteredData.reduce((acc: any, curr: any) => {
            acc.income += curr.income;
            acc.expense += curr.expense;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredData])
    return (
        <div>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                    <CardTitle className='text-muted-foreground text-sm'>Transaction Overview</CardTitle>
                    <Select defaultValue={dateRange} onValueChange={(value) => { setDateRange(value as keyof typeof DATE_RANGES) }}>
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(DATE_RANGES).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-row items-center justify-around mb-4'>
                        <div>
                            <p className='text-muted-foreground'>Total Income</p>
                            <p className='text-green-500 font-bold text-xl'>${totals.income.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className='text-muted-foreground'>Total Expense</p>
                            <p className='text-red-500 font-bold text-xl'>${totals.expense.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className='text-muted-foreground'>Net Income</p>
                            <p className={`${totals.income - totals.expense > 0 ? "text-green-500" : "text-red-500"} font-bold text-xl`}>${(totals.income - totals.expense).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className=' h-[300px]'>
                        <BarChart
                            style={{ width: '100%', height: '100%', aspectRatio: 1.618 }}
                            responsive
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" name={"Income"} fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name={"Expense"} fill="#f87171" radius={[4, 4, 0, 0]} />
                            <RechartsDevtools />
                        </BarChart>

                    </div>

                </CardContent>

            </Card>
        </div>
    )
}

export default AccountChart