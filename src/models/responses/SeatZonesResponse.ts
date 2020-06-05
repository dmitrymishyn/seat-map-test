import { RelationshipList } from './RelationshipsResponse';
import { Response, Attributes } from './Response';

export type SeatZoneRelationships = 'seats';

export type SeatZoneArea = {
  areaIndex: number;
  areaName: string | null;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SeatZoneEntityResponse = {
  zoneIndex: number;
  seatCount: number;
  areaCount: number;
  areas: SeatZoneArea[];
  version: string;
};
export type SeatZoneAttributtes = Attributes<'seatZones', SeatZoneEntityResponse, RelationshipList<SeatZoneRelationships>>;

export type SeatZoneResponse = Response<SeatZoneAttributtes[]>;
