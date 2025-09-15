import { CursorPage, ConversationDTO, FeedbackDTO } from "./types";


export const getConvsOnServer = async (
    { cursor, size }: { cursor?: string; size?: number } = {}
): Promise<CursorPage<ConversationDTO>> => {
    const query = new URLSearchParams();
    if (cursor) {
        query.set("cursor", cursor);
    }
    if (size !== undefined && size !== null) {
        query.set("size", String(size));
    }
    const resp = await fetch(`/api/conversations?${query}`);
    if (!resp.ok) {
        throw new Error("Error fetching shares");
    }
    return await resp.json();
}

export const getConvOnServer = async (id: string): Promise<ConversationDTO> => {
    const resp = await fetch(`/api/conversations/${id}`);
    if (!resp.ok) {
        throw new Error(`Failed to fetch conversation: ${resp.statusText}`);
    }
    return await resp.json();
};

/**
 * Create conversation
 * @param params
 * @returns
 */
export const createConvOnServer = async (payload: { title: string }): Promise<ConversationDTO> => {
    const resp = await fetch("/api/conversations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
    if (!resp.ok) {
        throw new Error("Error creating conv");
    }
    return await resp.json();
};


/**
 * Update conversation
 * @param payload
 * @returns
 */
export const updateConvOnServer = async (payload: ConversationDTO) => {
    const resp = await fetch(`/api/conversations/${payload.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: payload.title,
            pinned: payload.pinned,
        }),
    });

    if (!resp.ok) {
        throw new Error(`Failed to create share: ${resp.statusText}`);
    }
};

export const deleteConvOnServer = async (id: string): Promise<void> => {
    const resp = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
    });
    if (!resp.ok) {
        throw new Error(`Failed to delete conversation: ${resp.statusText}`);
    }
};

export const feedbackToServer = async (conv_id: string, run_id: string, payload: FeedbackDTO) => {
    const resp = await fetch(`/api/conversations/${conv_id}/runs/${run_id}/feedback`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!resp.ok) {
        throw new Error("Error feedback");
    }
}


export const interruptChat = async (convId: string) => {
    const resp = await fetch(`/api/conversations/${convId}/chat/interrupt`, {
        method: "POST",
    });
    if (!resp.ok) {
        throw new Error("Error interrupting")
    }
};

/**
 * Upload files to conversation
 *
 * @param {string} convId
 * @param {File} file
 */
export const uploadFile = async (convId: string, file: File) => {
    const formData = new FormData();
    formData.append("conv_id", convId);
    formData.append("file", file);
    return await fetch(`/api/files`, {
        method: "POST",
        body: formData,
    });
};
