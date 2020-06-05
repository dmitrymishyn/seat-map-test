import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import classnames from 'classnames';

import { SeatZoneArea, ZonedSeatsAttributtes, SeatZoneAttributtes, Seat, SeatRows } from '../../models';

import classes from './index.module.scss';
import { UnavailableRowSeats } from '../../models/UnavailableSeats';
import SeatingMapZone from './Zone';
import { SeatingMapActions } from './models';

type SeatingMapProps = {
  zones: SeatZoneAttributtes[] | null;
  seats: ZonedSeatsAttributtes[] | null;
  unavailableSeats: UnavailableRowSeats | null;
};

const SeatingMap: React.FC<SeatingMapProps> = ({ zones, seats, unavailableSeats }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [rendered, setRenderedStatus] = useState<boolean>(false);
  const [statuses, setStatuses] = useState<SeatingMapActions>({});

  const prepareChart = () => {
    const svg = d3.select(containerRef.current!);
    const mainGroup = svg.select('g');
    const visibleAreaSize = 320;
    const groupSizes = containerRef.current!.getBBox();
    const containerSizes = containerRef.current!.getBoundingClientRect();

    svg.attr('viewBox', [
      -groupSizes.width * 0.1,
      -groupSizes.height * 0.1,
      groupSizes.width * 1.2,
      groupSizes.height * 1.2,
    ] as any);

    const maxScale = groupSizes.width > containerSizes.width || groupSizes.height > containerSizes.height
      ? Math.max(groupSizes.width, groupSizes.height) / visibleAreaSize
      : 1;

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .translateExtent([
          [-groupSizes.width * 0.1, -groupSizes.height * 0.1],
          [groupSizes.width * 1.1, groupSizes.height * 1.1],
        ])
        .scaleExtent([1, maxScale])
        .on('zoom', () => mainGroup.attr('transform', d3.event.transform)),
    )
      .on('dblclick.zoom', null);
  };

  useEffect(() => {
    if ((!zones || !seats)) {
      setRenderedStatus(false);
      return;
    }

    prepareChart();
    setRenderedStatus(true);
  }, [zones, seats]);

  if (!zones || !seats) {
    return null;
  }

  const selectSeat = (name: string, value: any, seat: Seat, row: SeatRows, area: SeatZoneArea, zone: SeatZoneAttributtes) => {
    if (unavailableSeats?.[row.rowIndex]?.[seat.columnIndex]) {
      return;
    }

    setStatuses({
      ...statuses,
      [row.rowIndex]: {
        ...(statuses?.[row.rowIndex] ?? {}),
        [seat.columnIndex]: {
          ...(statuses?.[row.rowIndex]?.[seat.columnIndex] ?? {}),
          [name]: value,
        },
      },
    });

    console.log('there was event: ', name, value, { seat, row, area, zone }, statuses);
  };

  return (
    <svg className={classes.svg} ref={containerRef}>
      <g className={classnames(classes.mainGroup, rendered ? classes.mainGroupRendered : '')}>
        {zones.map(zone => (
          <SeatingMapZone
            key={zone.id}
            zone={zone}
            seats={seats.find(seat => seat.attributes.seatZoneId === parseInt(zone.id, 10))!}
            unavailableSeats={unavailableSeats}
            statuses={statuses}
            select={selectSeat}
          />
        ))}
      </g>
    </svg>
  );
};

export default SeatingMap;
