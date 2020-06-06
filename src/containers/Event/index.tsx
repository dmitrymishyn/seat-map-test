import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import qs from 'qs';

import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, pluck, tap } from 'rxjs/operators';

import classes from './index.module.scss';

import {
  ZonedSeatsAttributtes,
  SeatZoneAttributtes,
  UnavailableSeatsResponse,
  SeatZoneResponse,
  SeatMapResponse,
  UnavailableSeatsAttributtes,
  SeatsResponse,
  Seat,
  SeatRow,
} from '../../models';
import SeatingMap from '../../shared/SeatingMap';
import { UnavailableRowSeats } from '../../models/UnavailableSeats';
import { fetchEventInfo$, get$ } from '../../api';

const legenda = [
  { label: 'Available', color: '#C5CEE6' },
  { label: 'Reserved', color: '#6E7DA2' },
  { label: 'Your selection', color: '#4E1DE4' },
];
const parseUrl = (url: string) => url.replace('https://api.inventory.dev.external.hollywood.com/', '/');

const Event: React.FC = () => {
  const history = useHistory();
  const [status, setStatus] = useState<'pending' | 'completed' | 'error'>('pending');
  const [seats, setSeats] = useState<ZonedSeatsAttributtes[] | null>(null);
  const [selectedSeats, setsSelectedSeats] = useState<Record<string, Seat[]>>({});
  const [zones, setZones] = useState<SeatZoneAttributtes[] | null>(null);
  const [unavailableSeats, setUnavailableSeats] = useState<UnavailableRowSeats | null>(null);

  const select = (selectStatus: boolean, seat: Seat, row: SeatRow) => setsSelectedSeats({
    ...selectedSeats,
    [row.rowName]: selectStatus
      ? [...(selectedSeats?.[row.rowName] ?? []), seat]
      : [...(selectedSeats?.[row.rowName] ?? [])].filter(oldSeat => oldSeat.columnIndex !== seat.columnIndex),
  });

  const getTicketsCount = () => Object.values(selectedSeats).reduce((res, rowSeats) => res + rowSeats.length, 0);

  const loadData$ = (id: number): Observable<any> => fetchEventInfo$(id).pipe(
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
          tap(([loadedUnavailableSeats, ...loadedSeats]) => {
            setUnavailableSeats(loadedUnavailableSeats?.attributes.unavailableSeats.reduce((res, seat) => ({
              ...res,
              [seat.seatPosition.rowIndex]: {
                ...(res?.[seat.seatPosition.rowIndex] ?? {}),
                [seat.seatPosition.columnIndex]: seat.seatStatus,
              },
            }), {} as UnavailableRowSeats) ?? {});
            setSeats(loadedSeats);
            setZones(loadedZones);
          }),
        )),
      )),
    )),
  );

  useEffect(() => {
    setStatus('pending');
    setSeats(null);
    setZones(null);
    setUnavailableSeats(null);
    setsSelectedSeats({});

    const search = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const eventId = search?.['event_id'] as string || 11229;

    loadData$(+eventId).subscribe(
      () => setStatus('completed'),
      () => setStatus('error'),
    );
  }, [history.location.search]);

  if (status !== 'completed') {
    return (
      <div className={classes.pendingOrErrorContainer}>
        { status === 'pending'
          ? <CircularProgress />
          : <Typography color="textSecondary" variant="subtitle1">Something was broken</Typography>}
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Typography variant="h5" className={classes.title}>
        Molly&apos;s Game
      </Typography>
      <Typography variant="subtitle2" className={classes.subtitle}>
        AMC Sandbox: AMC Empire 25
      </Typography>
      <SeatingMap
        className={classes.map}
        zones={zones}
        seats={seats}
        unavailableSeats={unavailableSeats}
        select={select}
      />
      <div className={classes.legenda}>
        {legenda.map(({ label, color }) => (
          <span key={label} className={classes.legendaItem}>
            <span className={classes.legendaOption} style={{ background: color }} />
            <Typography variant="body2" className={classes.legendaLabel}>{label}</Typography>
          </span>
        ))}
      </div>
      <div className={classes.results}>
        <div className={classes.resultsRow}>
          <Typography variant="body2" className={classes.resultsRowTitle}>Tickets:</Typography>
          <Typography variant="body2">{getTicketsCount()}</Typography>
        </div>
        <div className={classes.resultsRow}>
          <Typography variant="body2" className={classes.resultsRowTitle}>Seats:</Typography>
          <div className={classes.resultsRowSeats}>
            {
              Object.entries(selectedSeats).sort((a, b) => a > b ? 1 : -1).map(([rowName, rowSeats]) => rowSeats?.length
                ? (
                  <Typography variant="body2" className={classes.selectedSeatsRow}>
                    {`${rowName} Row/ ${rowSeats.map(({ seatName }) => seatName).sort().join(', ')}`}
                  </Typography>
                )
                : null)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;
