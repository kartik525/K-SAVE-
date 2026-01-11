import React from "react";
import { toast } from "sonner";

export const useFetch = (cb: any) => {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<any>(null);

    const fn = async (...args: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cb(...args);
            setData(response);
        } catch (err: any) {
            setError(err);
            toast.error(err?.message);
        } finally {
            setLoading(false);
        }
    }
    return { data, loading, error, fn };
}