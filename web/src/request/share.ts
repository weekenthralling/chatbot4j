import { Page, ShareDTO } from "./types";


export const getSharesOnServer = async (
    { page, size }: { page?: number, size?: number } = {}
): Promise<Page<ShareDTO>> => {
    const query = new URLSearchParams();
    if (page !== undefined && page !== null) {
        query.set("page", String(page));
    }
    if (size !== undefined && size !== null) {
        query.set("size", String(size));
    }
    const resp = await fetch(`/api/shares?${query}`);
    if (!resp.ok) {
        throw new Error("Error fetching shares");
    }
    return await resp.json();
};

export const getShareOnServer = async (id: string): Promise<ShareDTO> => {
    const resp = await fetch(`/api/shares/${id}`);
    if (!resp.ok) {
        throw new Error(`Failed to fetch share: ${resp.statusText}`);
    }
    return await resp.json();
};

export const createShareOnServer = async (sourceId: string, title?: string): Promise<ShareDTO> => {
    const resp = await fetch("/api/shares", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            source_id: sourceId,
            title,
        }),
    });

    if (!resp.ok) {
        throw new Error(`Failed to create share: ${resp.statusText}`);
    }

    return await resp.json();
};

export const deleteShareOnServer = async (id: string) => {
    const resp = await fetch(`/api/shares/${id}`, {
        method: "DELETE",
    });
    if (!resp.ok) {
        throw new Error(`Error deleting share ${id}`);
    }
};
