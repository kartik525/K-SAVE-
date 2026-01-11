"use client"
import React, { useEffect } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { accountSchema } from '@/app/lib/schema'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectValue } from './ui/select'
import { SelectTrigger } from '@radix-ui/react-select'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { useFetch } from '@/app/hooks/useFetch'
import { createAccount } from '@/actions/dashboard'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const CreateAccountDrawer = ({ children }: { children: any }) => {
    const [open, setOpen] = React.useState(false)

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: 'CURRENT',
            balance: '',
            isDefault: false
        }
    })

    const { data: newAccount, loading: createAccountLoading, error, fn: createAccountFn } = useFetch(createAccount);

    useEffect(() => {
        if (newAccount && !createAccountLoading) {
            toast.success("Account created successfully");
            setOpen(false);
            reset();
        }
    }, [createAccountLoading, newAccount]);

    useEffect(() => {
        if (error) {
            toast.error(error?.message || "An error occurred");
        }
    }, [error]);
    const onsubmit = async (data: any) => {
        console.log("Form Data:", data);
        createAccountFn(data);
    }
    return (
        <div>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    {children}
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Create Account</DrawerTitle>
                    </DrawerHeader>
                    <div className='px-4 pb-4'>
                        <form className='space-y-4' onSubmit={handleSubmit(onsubmit)}>
                            <div className='space-y-2'>
                                <label htmlFor="name" className=' text-sm font-medium'>Account Name</label>
                                <Input type="text" id="name" className='w-full p-2 border rounded-md' {...register("name")} />
                                {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
                            </div>
                            <div className='space-y-2'>
                                <label htmlFor="type" className=' text-sm font-medium'>Account Type</label>
                                <Select onValueChange={(value) => setValue("type", value as "CURRENT" | "SAVINGS")} defaultValue={watch("type")}>
                                    <SelectTrigger className='w-full border p-2 rounded-md'>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent className='text-start'>
                                        <SelectItem value="CURRENT">Current</SelectItem>
                                        <SelectItem value="SAVINGS">Savings</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className='text-sm text-red-500 mt-1'>{errors.type.message}</p>}
                            </div>
                            <div className='space-y-2'>
                                <label htmlFor="balance" className=' text-sm font-medium'>Initial Balance</label>
                                <Input type="number" step={"0.01"} placeholder='0.0' id="balance" className='w-full p-2 border rounded-md' {...register("balance")} />
                                {errors.balance && <p className='text-sm text-red-500 mt-1'>{errors.balance.message}</p>}
                            </div>
                            <div className='flex items-center justify-between rounded-lg p-4 border'>
                                <div>
                                    <label htmlFor="isDefault" className=' text-sm font-medium'>Set as Default Account</label>
                                    <p className='text-sm text-muted-foreground'>
                                        This account will be set as your default account for transactions.
                                    </p>
                                </div>
                                <Switch id="isDefault" checked={watch("isDefault")} onCheckedChange={(checked) => setValue("isDefault", checked)} />
                                {/* {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>} */}
                            </div>
                            <div className='flex gap-4 pt-4'>
                                <DrawerClose asChild>
                                    <Button type='button' variant={'outline'} className='flex-1'>Cancel</Button>
                                </DrawerClose>
                                <Button type='submit' className='ml-2 flex-1'>
                                    {createAccountLoading ? <div className='flex items-center justify-around'><Loader2 className='mr-2 h-4 w-4 animate-spin' /><span>Loading...</span></div> : "Create Account"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default CreateAccountDrawer