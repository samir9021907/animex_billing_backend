/**
 * Centralized Backend Validation & Sanitization Utility
 * Ensures data integrity for Medical Stores, Products, and Invoices.
 */

export interface ValidationResult<T = any> {
    isValid: boolean;
    value?: T;
    error?: string;
}

/**
 * Validates and sanitizes phone numbers strictly to 10 digits starting with 6, 7, 8, or 9.
 */
export const validatePhoneNumber = (
    phone: any,
    fieldName: string = "Phone number",
    required: boolean = true
): ValidationResult<string> => {
    if (phone === undefined || phone === null || String(phone).trim() === "") {
        if (required) {
            return { isValid: false, error: `${fieldName} is required (फोन नंबर आवश्यक आहे)` };
        }
        return { isValid: true, value: "" };
    }

    const cleaned = String(phone).replace(/\D/g, "").slice(0, 10);

    if (cleaned.length !== 10) {
        return {
            isValid: false,
            error: `${fieldName} must be exactly 10 digits (${cleaned.length}/10 digits received)`
        };
    }

    if (!/^[6-9]/.test(cleaned)) {
        return {
            isValid: false,
            error: `${fieldName} must start with 6, 7, 8, or 9 (वैध १० अंकी मोबाईल नंबर टाका)`
        };
    }

    return { isValid: true, value: cleaned };
};

/**
 * Validates string fields (e.g. Firm Name, Product Title, Contact Name).
 */
export const validateString = (
    value: any,
    fieldName: string = "Field",
    minLength: number = 2,
    maxLength: number = 250,
    required: boolean = true
): ValidationResult<string> => {
    if (value === undefined || value === null || String(value).trim() === "") {
        if (required) {
            return { isValid: false, error: `${fieldName} is required (नाव आवश्यक आहे)` };
        }
        return { isValid: true, value: "" };
    }

    const trimmed = String(value).trim();

    if (trimmed.length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${minLength} characters (किमान ${minLength} अक्षरे आवश्यक आहेत)`
        };
    }

    if (trimmed.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} cannot exceed ${maxLength} characters`
        };
    }

    return { isValid: true, value: trimmed };
};

/**
 * Validates numeric values (price, MRP, quantity, box capacity).
 */
export const validateNumber = (
    value: any,
    fieldName: string = "Number",
    min: number = 0,
    max: number = Infinity,
    required: boolean = true
): ValidationResult<number> => {
    if (value === undefined || value === null || String(value).trim() === "") {
        if (required) {
            return { isValid: false, error: `${fieldName} is required` };
        }
        return { isValid: true, value: 0 };
    }

    const num = Number(value);

    if (isNaN(num)) {
        return { isValid: false, error: `${fieldName} must be a valid number` };
    }

    if (num < min) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${min}`
        };
    }

    if (num > max) {
        return {
            isValid: false,
            error: `${fieldName} cannot exceed ${max}`
        };
    }

    return { isValid: true, value: num };
};

/**
 * Validates standard 6-digit Indian PIN code.
 */
export const validatePincode = (pincode: any): ValidationResult<string> => {
    if (!pincode || String(pincode).trim() === "") {
        return { isValid: true, value: "" };
    }

    const cleaned = String(pincode).replace(/\D/g, "").slice(0, 6);

    if (cleaned.length !== 6) {
        return { isValid: false, error: "Pincode must be exactly 6 digits (६ अंकी पिनकोड आवश्यक आहे)" };
    }

    return { isValid: true, value: cleaned };
};

/**
 * Validates email address format.
 */
export const validateEmail = (
    email: any,
    fieldName: string = "Email",
    required: boolean = false
): ValidationResult<string> => {
    if (email === undefined || email === null || String(email).trim() === "") {
        if (required) {
            return { isValid: false, error: `${fieldName} is required (ईमेल आवश्यक आहे)` };
        }
        return { isValid: true, value: "" };
    }

    const trimmed = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return {
            isValid: false,
            error: `${fieldName} must be a valid email address (वैध ईमेल पत्ता टाका)`
        };
    }

    return { isValid: true, value: trimmed };
};

/**
 * Validates UUID v4 string.
 */
export const validateUUID = (
    id: any,
    fieldName: string = "ID",
    required: boolean = true
): ValidationResult<string> => {
    if (id === undefined || id === null || String(id).trim() === "") {
        if (required) {
            return { isValid: false, error: `${fieldName} is required` };
        }
        return { isValid: true, value: "" };
    }

    const str = String(id).trim();
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    if (!uuidRegex.test(str)) {
        return {
            isValid: false,
            error: `${fieldName} must be a valid UUID`
        };
    }

    return { isValid: true, value: str };
};

/**
 * Validates non-empty array with optional item verification.
 */
export const validateArray = (
    arr: any,
    fieldName: string = "Items",
    minItems: number = 1
): ValidationResult<any[]> => {
    if (!arr || !Array.isArray(arr)) {
        return {
            isValid: false,
            error: `${fieldName} must be an array (सूची आवश्यक आहे)`
        };
    }

    if (arr.length < minItems) {
        return {
            isValid: false,
            error: `${fieldName} must contain at least ${minItems} item(s) (किमान ${minItems} आयटम आवश्यक आहे)`
        };
    }

    return { isValid: true, value: arr };
};
