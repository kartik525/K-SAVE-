export default function serializeAccount(account: any) {
    return {
        ...account,
        balance: account.balance.toNumber(),
    };
}
