"use client"
import { updateBudget } from '@/actions/budget'
import { useFetch } from '@/app/hooks/useFetch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Check, Pencil, X } from 'lucide-react'
import React, { use, useEffect } from 'react'
import { toast } from 'sonner'

const BudgetProgress = ({ initialBudget, currentExpenses }: { initialBudget: any, currentExpenses: number }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [newBudget, setNewBudget] = React.useState(initialBudget?.amount?.toString() || "")

  const percentUsed = initialBudget ? (currentExpenses / initialBudget.amount) * 100 : 0

  const { data: updatedBudget, loading: isLoading, fn: updateBudgetFn, error } = useFetch(updateBudget)



  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
    }
    await updateBudgetFn({ amount })

  }
  useEffect(() => {
    if (updatedBudget) {
      setIsEditing(false)
      toast.success("Budget updated successfully")
    }
  }, [updatedBudget])

  useEffect(() => {
    if (error) {
      toast.error(error?.message || "An error occurred")
    }
  }, [error])

  const handleCancel = () => {
    setIsEditing(false)
    setNewBudget(initialBudget?.amount?.toString() || "")
  }

  return (
    <div>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='flex-1'>
            <CardTitle className='mb-2'>Monthly Budget (default account)
            </CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              {isEditing ? (
                <div>
                  <Input value={newBudget} onChange={(e) => setNewBudget(e.target.value)} placeholder='Enter Amount' type='number' className='w-32 h-8' />
                  <Button variant={'ghost'} size={"icon"} className='h-4 w-4 ml-4 text-green-500' onClick={handleUpdateBudget}><Check /></Button>
                  <Button variant={'ghost'} size={"icon"} className='h-4 w-4 ml-2 text-red-500' onClick={handleCancel}><X /></Button>

                </div>
              ) : (
                <>
                  <CardDescription>
                    {initialBudget ?
                      `${currentExpenses.toFixed(2)} used out of ${initialBudget.amount.toFixed(2)}`
                      : `No budget set`}
                  </CardDescription>
                  <Button onClick={() => setIsEditing(true)} variant={'ghost'} size={"icon"}><Pencil /></Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {initialBudget && (
            <div className='space-y-2'>
              <Progress value={percentUsed}
                extraStyles={`h-2 ${percentUsed > 90 ? 'bg-red-500' : 'bg-green-500'}`} />
              <p className='text-xs text-muted-foreground text-right'>Percentage used: {percentUsed.toFixed(2)}%</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

export default BudgetProgress