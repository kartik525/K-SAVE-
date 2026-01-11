"use client"
import { bulkDeleteTransactions } from '@/actions/account'
import { categoryColors } from '@/app/data/categories'
import { useFetch } from '@/app/hooks/useFetch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { dir } from 'console'
import { formatDate } from 'date-fns'
import { ChevronUp, Clock, MoreHorizontal, RefreshCcw, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'

const RECURRING_INTERVALS: any = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
}

const TransactionTable = ({ transactions }: { transactions: any }) => {
    const router = useRouter();

    const [selectedIds, setSelectedIds] = React.useState<any[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterCategory, setFilterCategory] = useState<string | undefined>("");
    const [recurringType, setRecurringType] = useState<string | undefined>("");

    const [sortConfig, setSortConfig] = React.useState({
        field: 'date',
        direction: 'desc'
    });
    console.log(filterCategory, recurringType, "filtercategoryy");

    const filterAndSortedTransactions = useMemo(() => {
        let res = [...transactions];
        if (searchTerm) {
            res = res.filter((transaction) =>
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory) {
            res = res.filter((transaction) => transaction.type === filterCategory);
        }
        if (recurringType) {
            if (recurringType === "recurring") {
                res = res.filter((transaction) => transaction.isRecurring);
            } else {
                res = res.filter((transaction) => !transaction.isRecurring);
            }
        }
        if (sortConfig.field) {
            res = res.sort((a: any, b: any) => {
                if (a[sortConfig.field] < b[sortConfig.field]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.field] > b[sortConfig.field]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }




        return res;
    }, [transactions, searchTerm, filterCategory, recurringType, sortConfig]); // Apply filtering and sorting logic here
    const handleSelect = (id: any) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }


    }
    const handleSelectAll = () => {
        if (selectedIds.length === filterAndSortedTransactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filterAndSortedTransactions.map((transaction: any) => transaction.id));
        }
    }
    console.log(selectedIds, "selctedIDs");

    // const [data:deleted,loading:deleteLoading,fn:deleteTransactions]=useFetch(bulkDeleteTransactions)4
    const { data: deleted, loading: deleteLoading, fn: deleteTransactions } = useFetch(bulkDeleteTransactions);
    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions? This action cannot be undone.`)) {
            return
        } else {
            await deleteTransactions(selectedIds);
            setSelectedIds([]);
        }
    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.success("Transactions deleted successfully");
        }
    }, [deleted, deleteLoading])


    const handleSort = (column: string) => {
        setSortConfig((current: any) => ({
            field: column,
            direction: current.field === column && current.direction === 'asc' ? 'desc' : 'asc'
        }))


    }
    return (
        <div className='space-y-4'>
            {deleteLoading && <BarLoader color="#6c47ff" width={'100%'} />}
            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-4' >
                <div className='relative flex-1'>
                    <Search className=' absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input className='pl-12' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className='flex flex-row gap-2'>
                    <Select
                        value={filterCategory}
                        onValueChange={(value) => {
                            setFilterCategory(value);
                            // setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={recurringType}
                        onValueChange={(value) => {
                            setRecurringType(value);
                            // setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedIds.length > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            Delete Selected ( {selectedIds.length} )
                        </Button>
                    )}
                    {(filterCategory || recurringType || searchTerm) && (
                        <Button variant="outline" onClick={() => {
                            setFilterCategory(undefined);
                            setRecurringType(undefined);
                            setSearchTerm('');
                        }}>
                            <X className=' h-4 w-4 mr-1' /> Clear Filters
                        </Button>
                    )}


                </div>
            </div>

            {/* Table */}

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-12'>
                                <Checkbox onCheckedChange={() => handleSelectAll()} />
                            </TableHead>
                            <TableHead className='cursor-pointer'
                                onClick={() => handleSort('date')}>
                                <div className='flex items-center'>Date {sortConfig.field === 'date' && sortConfig.direction === 'asc' ? <ChevronUp className='ml-1 h-4 w-4' /> : sortConfig.field === 'date' && sortConfig.direction === 'desc' ? <ChevronUp className='rotate-180 ml-1 h-4 w-4' /> : ''}</div>
                            </TableHead>
                            <TableHead>
                                Description
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('category')}>
                                <div className='flex items-center'>Category{sortConfig.field === 'category' && sortConfig.direction === 'asc' ? <ChevronUp className='ml-1 h-4 w-4' /> : sortConfig.field === 'category' && sortConfig.direction === 'desc' ? <ChevronUp className='rotate-180 ml-1 h-4 w-4' /> : ''}</div>
                            </TableHead>
                            <TableHead className='cursor-pointer' onClick={() => handleSort('amount')}>
                                <div className='flex items-center justify-end'>
                                    Amount {sortConfig.field === 'amount' && sortConfig.direction === 'asc' ? <ChevronUp className='ml-1 h-4 w-4' /> : sortConfig.field === 'amount' && sortConfig.direction === 'desc' ? <ChevronUp className='rotate-180 ml-1 h-4 w-4' /> : ''}
                                </div>
                            </TableHead>
                            <TableHead>
                                Recurring
                            </TableHead>
                            <TableHead className='w-12' />
                        </TableRow>
                    </TableHeader>
                    <TableBody >
                        {filterAndSortedTransactions.length === 0 ?
                            <TableRow>
                                <TableCell colSpan={7} className=' text-center py-10'>
                                    No transactions found.
                                </TableCell>
                            </TableRow> :
                            filterAndSortedTransactions.map((transaction: any) => (
                                <TableRow key={transaction.id}>
                                    <TableCell><Checkbox checked={selectedIds.includes(transaction.id) || selectedIds.length === filterAndSortedTransactions.length} onCheckedChange={() => handleSelect(transaction.id)} /></TableCell>
                                    <TableCell>{formatDate(transaction.date, "Pp")}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>
                                        <span style={{ backgroundColor: categoryColors[transaction.category] }} className={` capitalize px-2 py-1 rounded text-white text-sm`} >
                                            {transaction.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className='text-right font-medium' style={{
                                        color: transaction.type === "INCOME" ? "green" : "red"
                                    }}>${transaction.amount}</TableCell>
                                    <TableCell>
                                        {transaction.isRecurring ?
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge variant="outline" className='flex items-center bg-purple-100 text-purple-800 hover:bg-purple-200'>
                                                            <RefreshCcw className=' h-4 w-4 mr-1' />
                                                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent >
                                                        <div>Next Date:</div>
                                                        <div>{formatDate(transaction.nextRecurringDate, "Pp")}</div>

                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider> :
                                            <Badge variant="outline" className='flex items-center'>
                                                <Clock className=' h-4 w-4 mr-1' />
                                                One-time</Badge>}

                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className=' p-0 h-8 w-8'>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel
                                                    onClick={() => {
                                                        router.push(`/transaction/create?edit=${transaction.id}`)
                                                    }} className='cursor-pointer'>
                                                    Edit
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className=' text-destructive'
                                                    onClick={async () => {
                                                        // Handle delete action
                                                        await deleteTransactions([transaction.id]);
                                                    }}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}

export default TransactionTable