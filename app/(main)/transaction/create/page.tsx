import { getAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/app/data/categories'
import React from 'react'
import AddTransactionForm from '../_components/AddTransactionForm'
import { getTransactionById } from '@/actions/transaction'

const AddTransactionPage = async ({ searchParams }: any) => {
    const accounts = await getAccounts()
    console.log(accounts, "accounts fetched");
    // console.log(searchParams, "searchparams");

    const values = await searchParams
    const editId = values?.edit
    let initialData = null
    if (editId) {
        const transaction = await getTransactionById(editId)
        initialData = transaction
    }

    return (
        <div className='max-w-3xl mx-auto px-5'>
            <h1 className='text-5xl gradient-title mb-8'>{editId ? "Edit Transaction" : "Add Transaction"}</h1>
            <AddTransactionForm accounts={accounts?.data} categories={defaultCategories} editMode={!!editId} initialData={initialData?.data} />
        </div>
    )
}

export default AddTransactionPage