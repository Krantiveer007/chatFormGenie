export interface QueryPayload {
    category_id?: number;
    category_type?: string;
    command?: string;
    predictedMessage?: string;
}

export interface QueryResponse {
    meta?: MetaData[];
}

export interface MetaData {
    category_id: number;
    category_type: string;//template, question,module, id:123123
    fieldType: string;
    label: string;
    is_mandatory?: boolean;
    options?: any[];
    sequence?: number;
    queryResponse?: any;
}

export interface PredictionPayload {
    category_id: number;
    category_type: string;
    fieldType?: string;
    message?: string | Blob;
    file?: any;
}

export interface PredictionResponseDraftPayload {
    category_id?: number;
    category_type?: string;
    command?: string;
    predictedMessage?: string;
    predictedMessageId?: number;
}
