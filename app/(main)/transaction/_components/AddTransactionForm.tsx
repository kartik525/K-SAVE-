"use client"
import { createTransaction, updateTransaction } from '@/actions/transaction'
import { useFetch } from '@/app/hooks/useFetch'
import { transactionSchema } from '@/app/lib/schema'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Button } from '@/components/ui/button'
import { CalendarDayButton } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDate } from 'date-fns'
import { Calendar1Icon, Loader, Watch } from 'lucide-react'

import { Calendar } from "@/components/ui/calendar"
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ReceiptScan from './ReceiptScan'

const AddTransactionForm = ({ accounts, categories, editMode, initialData }: { accounts: any, categories: any, editMode?: boolean, initialData?: any }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams?.get('edit')
    console.log(initialData, "initialData");

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: editMode && initialData ? {
            type: initialData.type,
            amount: initialData.amount,
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            recurringInterval: initialData.recurringInterval,
        } : {

            type: 'EXPENSE',
            amount: '',
            description: '',
            accountId: accounts.find((id: any) => id.isDefault)?.id,
            category: categories[0].id,
            date: new Date(),
            isRecurring: false,
            recurringInterval: 'MONTHLY'
        }

    })
    const filteredTypes = categories.filter((category: any) => category.type === getValues('type'))

    const { data: transactionData, loading: transactionLoading, fn: createTransactionFn, error } = useFetch(editMode ? updateTransaction : createTransaction)


    const onSubmit = async (data: any) => {

        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        }
        if (editMode) {
            createTransactionFn(editId, formData)
        } else {
            createTransactionFn(formData)
        }

    }
    useEffect(() => {
        if (transactionData && !transactionLoading) {
            toast.success(editMode ? "Transaction updated successfully" : "Transaction created successfully");
            reset();
            router.push(`/account/${transactionData.data.accountId}`);

        }
    }, [transactionData, transactionLoading, editMode])

    useEffect(() => {
        if (error) {
            console.log(error);

            toast.error(error?.message || "An error occurred");
        }
    }, [error]);

    return (
        <form action="" className='space-y-6 pb-8' onSubmit={handleSubmit(onSubmit)}>

            {!editMode && <ReceiptScan onScanComplete={(data: any) => {
                if (data) {
                    console.log(data, "data scanned");

                    setValue("amount", data.amount)
                    setValue("description", data?.description || "")
                    setValue("date", new Date(data.date))
                    setValue("category", data.category)
                }
            }} />}
            <div className=' space-y-2'>
                <label htmlFor="type" className='text-sm font-medium'>Type</label>
                <Select defaultValue={watch('type')} onValueChange={(value) => { setValue("type", value as "EXPENSE" | "INCOME") }}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>}
            </div>
            <div className='flex flex-col md:flex-row items-center gap-2'>
                <div className=' space-y-2 w-full'>
                    <label htmlFor="amount" className='text-sm font-medium'>Amount</label>
                    <Input   {...register("amount")} type="float" className='w-full border border-gray-300 rounded-md p-2' />
                    {errors.amount && <p className='text-sm text-red-500'>{errors.amount.message}</p>}
                </div>
                <div className=' w-full'>
                    <label htmlFor="account" className='text-sm font-medium'>Account</label>
                    <Select defaultValue={watch('accountId')} onValueChange={(value) => { setValue("accountId", value as string) }}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account: any) => (
                                <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button variant={"ghost"} className='w-full select-none items-center text-sm outline-none'>Create Account</Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {errors.accountId && <p className='text-sm text-red-500'>{errors.accountId.message}</p>}
                </div>


            </div>
            <div className=' space-y-2 '>
                <label htmlFor="category" className='text-sm font-medium'>Category</label>
                <Select defaultValue={watch('category')} onValueChange={(value) => { setValue("category", value as string) }}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredTypes.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && <p className='text-sm text-red-500'>{errors.category.message}</p>}
            </div>
            <div>
                <label htmlFor="date" className='text-sm font-medium'>Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={'outline'} className='w-full text-left border border-gray-300 rounded-md p-2'>{watch('date') ? formatDate(watch('date'), 'PPP') : <span>
                            Select a date</span>}
                            <Calendar1Icon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align="start">
                        <Calendar
                            mode="single"
                            selected={watch('date')}
                            onSelect={(date) => { setValue("date", date as Date) }}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        />
                    </PopoverContent>
                </Popover>
                {errors.date && <p className='text-sm text-red-500'>{errors.date.message}</p>}
            </div>
            <div className='space-y-2'>
                <label htmlFor="description" className='text-sm font-medium'>Description</label>
                <Input {...register("description")} type="text" className='w-full border border-gray-300 rounded-md p-2' placeholder='Add Description' />
                {errors.description && <p className='text-sm text-red-500'>{errors.description.message}</p>}
            </div>
            <div className='flex items-center justify-between rounded-lg p-4 border mt-2'>
                <div>
                    <label htmlFor="isRecurring" className=' text-sm font-medium'>Recurring Transaction</label>
                    <p className='text-sm text-muted-foreground'>
                        Set up a recurring schedule for this transaction
                    </p>
                </div>
                <Switch id="isDefault" checked={watch("isRecurring")} onCheckedChange={(checked) => setValue("isRecurring", checked)} />
                {/* {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>} */}
            </div>
            {getValues("isRecurring") && (
                <div className='space-y-2'>
                    <label htmlFor="recurringInterval" className='text-sm font-medium'>Recurring Interval</label>

                    <Select defaultValue={watch('recurringInterval')} onValueChange={(value) => { setValue("recurringInterval", value as "MONTHLY" || "WEEKLY" || "YEARLY" || "DAILY") }}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select an interval" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                    </Select>

                </div>


            )}
            <div className='space-y-2'>
                <Button type='button' variant={"outline"} className='w-full' onClick={() => { router.back() }}>Cancel</Button>
                <Button type='submit' variant={"default"} className='w-full'>{transactionLoading ? <><Loader className='h-4 w-4 animate-spin mr-2' /> {editMode ? "Updating..." : "Adding..."}</> : editMode ? "Update Transaction" : "Add Transaction"}</Button>

            </div>

        </form>

    )
}

export default AddTransactionForm