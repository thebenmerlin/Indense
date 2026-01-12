import { IndentStatus } from '@prisma/client';
import { InvalidStateTransitionError } from '../../utils/errors';

/**
 * Indent State Machine
 * 
 * Defines valid state transitions for material indents.
 * States CANNOT be skipped - must follow the defined flow.
 * 
 * Flow:
 * SUBMITTED -> PURCHASE_APPROVED -> DIRECTOR_APPROVED -> ORDER_PLACED
 *           -> PARTIALLY_RECEIVED or FULLY_RECEIVED -> CLOSED
 * 
 * Rejection can happen from SUBMITTED or PURCHASE_APPROVED states.
 */

// Define valid transitions for each state
const validTransitions: Record<IndentStatus, IndentStatus[]> = {
    [IndentStatus.SUBMITTED]: [
        IndentStatus.PURCHASE_APPROVED,
        IndentStatus.REJECTED,
    ],
    [IndentStatus.PURCHASE_APPROVED]: [
        IndentStatus.DIRECTOR_APPROVED,
        IndentStatus.REJECTED,
    ],
    [IndentStatus.DIRECTOR_APPROVED]: [
        IndentStatus.ORDER_PLACED,
    ],
    [IndentStatus.ORDER_PLACED]: [
        IndentStatus.PARTIALLY_RECEIVED,
        IndentStatus.FULLY_RECEIVED,
    ],
    [IndentStatus.PARTIALLY_RECEIVED]: [
        IndentStatus.FULLY_RECEIVED,
        IndentStatus.PARTIALLY_RECEIVED, // Can receive more
    ],
    [IndentStatus.FULLY_RECEIVED]: [
        IndentStatus.CLOSED,
    ],
    [IndentStatus.CLOSED]: [], // Terminal state
    [IndentStatus.REJECTED]: [], // Terminal state
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
    currentState: IndentStatus,
    targetState: IndentStatus
): boolean {
    const allowedStates = validTransitions[currentState] || [];
    return allowedStates.includes(targetState);
}

/**
 * Validate state transition and throw if invalid
 */
export function validateTransition(
    currentState: IndentStatus,
    targetState: IndentStatus
): void {
    if (!isValidTransition(currentState, targetState)) {
        throw new InvalidStateTransitionError(currentState, targetState);
    }
}

/**
 * Get allowed next states for a given state
 */
export function getAllowedTransitions(currentState: IndentStatus): IndentStatus[] {
    return validTransitions[currentState] || [];
}

/**
 * Check if indent can be approved by purchase team
 */
export function canPurchaseApprove(status: IndentStatus): boolean {
    return status === IndentStatus.SUBMITTED;
}

/**
 * Check if indent can be approved by director
 */
export function canDirectorApprove(status: IndentStatus): boolean {
    return status === IndentStatus.PURCHASE_APPROVED;
}

/**
 * Check if order can be placed for indent
 */
export function canPlaceOrder(status: IndentStatus): boolean {
    return status === IndentStatus.DIRECTOR_APPROVED;
}

/**
 * Check if receipt can be recorded for indent
 */
export function canRecordReceipt(status: IndentStatus): boolean {
    return status === IndentStatus.ORDER_PLACED ||
        status === IndentStatus.PARTIALLY_RECEIVED;
}

/**
 * Check if indent can be closed
 * Indent can only be closed if:
 * 1. Status is FULLY_RECEIVED
 * 2. No unresolved damage reports exist
 */
export function canClose(status: IndentStatus): boolean {
    return status === IndentStatus.FULLY_RECEIVED;
}

/**
 * Check if indent status allows viewing order details
 */
export function hasOrderDetails(status: IndentStatus): boolean {
    return [
        IndentStatus.ORDER_PLACED,
        IndentStatus.PARTIALLY_RECEIVED,
        IndentStatus.FULLY_RECEIVED,
        IndentStatus.CLOSED,
    ].includes(status);
}

export default {
    isValidTransition,
    validateTransition,
    getAllowedTransitions,
    canPurchaseApprove,
    canDirectorApprove,
    canPlaceOrder,
    canRecordReceipt,
    canClose,
    hasOrderDetails,
};
