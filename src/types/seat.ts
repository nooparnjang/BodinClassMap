export type SeatStatus =
    | "available"
    | "occupied"
    | "pending"
    | "mine";

export interface Seat {
    id: string;
    number: number;
    status: SeatStatus;

    reservedBy?: string;
}