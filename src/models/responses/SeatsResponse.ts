import { Response, Attributes } from './Response';

export type SeatType = 'standard' | 'wheelchair-companion' | 'wheelchair';

export type Seat = {
  columnIndex: number;
  seatName: string;
  seatType: SeatType;
};

export type SeatRows = {
  rowIndex: number;
  rowName: string;
  rowSeats: Seat[];
};

export type SeatArea = {
  areaIndex: number;
  rowCount: number;
  columnCount: number;
  rows: SeatRows[];
};

export type SeatZonesEntityResponse = {
  seatZoneId: number;
  seats: SeatArea[];
};
export type ZonedSeatsAttributtes = Attributes<'seats', SeatZonesEntityResponse>;

export type SeatsResponse = Response<ZonedSeatsAttributtes[]>;
