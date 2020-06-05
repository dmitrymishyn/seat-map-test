export type SeatingMapSeatActions = Record<string, any>;
export type SeatingMapRowActions = Record<string, SeatingMapSeatActions>;
export type SeatingMapActions = Record<string, SeatingMapRowActions>;
