import React from 'react';

import { SeatZoneArea, ZonedSeatsAttributtes, SeatZoneAttributtes, Seat, SeatRows } from '../../models';

import classes from './index.module.scss';
import { UnavailableRowSeats } from '../../models/UnavailableSeats';
import { SeatingMapActions } from './models';
import SeatingMapArea from './Area';

type ZoneProps = {
  zone: SeatZoneAttributtes;
  seats: ZonedSeatsAttributtes;
  statuses: SeatingMapActions;
  unavailableSeats: UnavailableRowSeats | null;
  select: (name: string, value: any, seat: Seat, row: SeatRows, area: SeatZoneArea, zone: SeatZoneAttributtes) => void;
};

const SeatingMapZone: React.FC<ZoneProps> = ({ zone, seats, select, statuses, unavailableSeats }) => (
  <g className={classes.zone}>
    {zone.attributes.areas.map(area => (
      <SeatingMapArea
        key={area.areaIndex}
        seats={seats.attributes.seats.find(seat => seat.areaIndex === area.areaIndex)!}
        unavailableSeats={unavailableSeats}
        statuses={statuses}
        select={(name, value, seat, row) => select(name, value, seat, row, area, zone)}
      />
    ))}
  </g>
);

export default SeatingMapZone;
