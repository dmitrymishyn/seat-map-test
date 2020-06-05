import { RelationshipList } from './RelationshipsResponse';
import { Response, Attributes } from './Response';

export type EventRelationships =
  'eventStatus'
  | 'eventType'
  | 'features'
  | 'format'
  | 'movie'
  | 'seatingPreview'
  | 'seatingType'
  | 'seatMap'
  | 'soldOutStatus'
  | 'subVenueType'
  | 'syndications'
  | 'tickets'
  | 'timeOfDay'
  | 'unavailableSeats'
  | 'venue';

export type EventEntityResponse = {
  expirationTimeUtc: string;
  isReservedSeating: boolean;
  isSellable: boolean;
  scheduleDate: string;
  startTimeLocal: string;
  startTimeUtc: string;
  subVenue: string;
  version: string;
};
export type EventAttributes = Attributes<'events', EventEntityResponse, RelationshipList<EventRelationships>>;

export type EventResponse = Response<EventAttributes>;
