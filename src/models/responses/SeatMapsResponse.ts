import { RelationshipList } from './RelationshipsResponse';
import { Response, Attributes } from './Response';

export type SeatMapRelationships = 'seatZones';

export type SeatMapEntityResponse = {
  seatCount: number;
  zoneCount: number;
  version: string;
};
export type SeatMapAttributes = Attributes<'seatMap', SeatMapEntityResponse, RelationshipList<SeatMapRelationships>>;

export type SeatMapResponse = Response<SeatMapAttributes>;
