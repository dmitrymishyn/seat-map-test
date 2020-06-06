import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import classnames from 'classnames';
import { fromEvent, merge, of, Observable, timer } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { SeatZoneArea, ZonedSeatsAttributtes, SeatZoneAttributtes, Seat, SeatRow } from '../../models';

import classes from './index.module.scss';
import { UnavailableRowSeats } from '../../models/UnavailableSeats';
import SeatingMapZone from './Zone';
import { SeatingMapActions, layoutConfig } from './models';

type SeatingMapProps = {
  zones: SeatZoneAttributtes[] | null;
  seats: ZonedSeatsAttributtes[] | null;
  unavailableSeats: UnavailableRowSeats | null;
  className: string;
  select: (selectStatus: boolean, seat: Seat, row: SeatRow) => void;
};

const SeatingMap: React.FC<SeatingMapProps> = ({ className, zones, seats, unavailableSeats, select }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const sceneRef = useRef<SVGGElement>(null);
  const seatingMapRef = useRef<SVGGElement>(null);
  const wrapperRef = useRef<SVGGElement>(null);
  const [rendered, setRenderedStatus] = useState<boolean>(false);
  const [statuses, setStatuses] = useState<SeatingMapActions>({});

  const setViewBox = () => {
    const svg = d3.select(containerRef.current!);
    const groupSizes = wrapperRef.current!.getBBox();

    svg.attr('viewBox', [
      -layoutConfig.axes.gap - layoutConfig.axes.width,
      -layoutConfig.scene.curveRadius,
      groupSizes.width,
      // magin number 10 - need to investigate why we need that
      groupSizes.height + 10,
    ] as any);
  };

  const subscribeOnZoom$ = () => {
    const svg = d3.select(containerRef.current!);
    const mainGroup = d3.select(wrapperRef.current!);
    const groupSizes = wrapperRef.current!.getBBox();
    const containerSizes = containerRef.current!.getBoundingClientRect();
    const visibleAreaSize = 320;
    const maxScale = groupSizes.width > containerSizes.width || groupSizes.height > containerSizes.height
      ? Math.max(groupSizes.width, groupSizes.height) / visibleAreaSize
      : 1;

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .translateExtent([
          [
            -layoutConfig.axes.gap - layoutConfig.axes.width,
            -layoutConfig.scene.curveRadius,
          ],
          [
            groupSizes.width - layoutConfig.axes.gap - layoutConfig.axes.width,
            // magin number 10 - need to investigate why we need that
            groupSizes.height - layoutConfig.scene.curveRadius + 10,
          ],
        ])
        .scaleExtent([1, maxScale])
        .on('zoom', () => mainGroup.attr('transform', d3.event.transform)),
    ).on('dblclick.zoom', null);

    // Only unsubscribe
    return new Observable(() => () => svg.on('.zoom', null));
  };

  const createScene = () => {
    const sceneGroup = d3.select(sceneRef.current!);

    const mainGroupSizes = seatingMapRef.current!.getBBox();
    const width = mainGroupSizes.width - layoutConfig.axes.gap * 2 - layoutConfig.scene.paddingLeft - layoutConfig.scene.paddingRight;
    const line = d3.line()
      .curve(d3.curveBasis);

    sceneGroup.append('path')
      .datum([
        [layoutConfig.scene.paddingLeft, 0],
        [width / 2, -layoutConfig.scene.curveRadius],
        [width, 0],
      ] as [number, number][])
      .attr('d', line);
  };

  useEffect(() => {
    if ((!zones || !seats)) {
      setRenderedStatus(false);
      return () => undefined;
    }

    createScene();
    setViewBox();
    setRenderedStatus(true);

    const listenEvents$ = () => merge(
      fromEvent(window, 'resize'),
      of(true),
    ).pipe(
      debounceTime(200),
      // Timer to make sure that we successfully remove old zoom event
      switchMap(() => timer(0).pipe(
        switchMap(() => subscribeOnZoom$()),
      )),
    );

    const unsubscriber = listenEvents$().subscribe();

    return () => unsubscriber.unsubscribe();
  }, [zones, seats]);

  if (!zones || !seats) {
    return null;
  }

  const selectSeat = (name: string, value: any, seat: Seat, row: SeatRow, area: SeatZoneArea, zone: SeatZoneAttributtes) => {
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

    select(value, seat, row);

    console.log('there was event: ', name, value, { seat, row, area, zone }, statuses);
  };

  return (
    <svg className={classnames(className, classes.svg)} ref={containerRef}>
      <g ref={wrapperRef} className={classnames(classes.mainGroup, rendered ? classes.mainGroupRendered : '')}>
        <g ref={sceneRef} className={classnames(classes.scene)} />
        <g ref={seatingMapRef} transform="translate(0, 100)">
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
      </g>
    </svg>
  );
};

export default SeatingMap;
