import React, { useEffect, useState } from 'react';
import { combineLatest, Observable } from 'rxjs';
import { tap, pluck, switchMap } from 'rxjs/operators';

import { fetchEventInfo$, get$ } from './api';
import {
  SeatMapResponse,
  SeatZoneResponse,
  SeatsResponse,
  SeatZoneAttributtes,
  ZonedSeatsAttributtes,
  UnavailableSeatsResponse,
  UnavailableSeatsAttributtes,
} from './models';

import './App.css';
import SeatingMap from './shared/SeatingMap';
import { UnavailableRowSeats } from './models/UnavailableSeats';

const parseUrl = (url: string) => url.replace('https://api.inventory.dev.external.hollywood.com/', '/');

const App: React.FC = () => {
  const [seats, setSeats] = useState<ZonedSeatsAttributtes[] | null>(null);
  const [zones, setZones] = useState<SeatZoneAttributtes[] | null>(null);
  const [unavailableSeats, setUnavailableSeats] = useState<UnavailableRowSeats | null>(null);

  const doSmth = (id: number): Observable<any> => fetchEventInfo$(id).pipe(
    pluck('data'),
    switchMap(event => get$<SeatMapResponse>(parseUrl(event.relationships.seatMap.links.related)).pipe(
      pluck('data'),
      switchMap(seatMap => get$<SeatZoneResponse>(parseUrl(seatMap.relationships.seatZones.links.related)).pipe(
        pluck('data'),
        switchMap(loadedZones => combineLatest<[UnavailableSeatsAttributtes, ...ZonedSeatsAttributtes[]]>([
          get$<UnavailableSeatsResponse>(parseUrl(event.relationships.unavailableSeats.links.related)).pipe(pluck('data')),
          ...loadedZones.map(
            zone =>
              get$<SeatsResponse>(parseUrl(zone.relationships.seats.links.related)).pipe(
                pluck('data'),
              ),
          ),
        ]).pipe(
          tap(([test, ...loadedSeats]) => {
            setUnavailableSeats(test.attributes.unavailableSeats.reduce((res, seat) => ({
              ...res,
              [seat.seatPosition.rowIndex]: {
                ...(res?.[seat.seatPosition.rowIndex] ?? {}),
                [seat.seatPosition.columnIndex]: seat.seatStatus,
              },
            }), {} as UnavailableRowSeats));
            setSeats(loadedSeats);
            setZones(loadedZones);
          }),
        )),
      )),
    )),
  );

  useEffect(() => {
    doSmth(13826).subscribe();
  }, []);

  return (
    <SeatingMap
      zones={zones}
      seats={seats}
      unavailableSeats={unavailableSeats}
    />
  );
};

export default App;
