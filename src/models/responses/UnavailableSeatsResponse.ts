import { Response, Attributes } from './Response';

export type UnavailableSeatsEntityResponse = {
  unavailableSeats: {
    seatPosition: {
      areaIndex: number;
      columnIndex: number;
      rowIndex: number;
      zoneIndex: number;
    };
    seatStatus: string;
  }[];
};
export type UnavailableSeatsAttributtes = Attributes<'unavailableSeats', UnavailableSeatsEntityResponse>;

export type UnavailableSeatsResponse = Response<UnavailableSeatsAttributtes>;
