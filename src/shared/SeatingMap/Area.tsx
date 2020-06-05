import React from 'react';
import classnames from 'classnames';

import { SeatArea, SeatRows, SeatType, Seat } from '../../models';
import classes from './index.module.scss';
import { UnavailableRowSeats } from '../../models/UnavailableSeats';
import { SeatingMapActions } from './models';

type AreaProps = {
  seats: SeatArea;
  unavailableSeats: UnavailableRowSeats | null;
  select: (name: string, value: any, seat: Seat, row: SeatRows) => void;
  statuses: SeatingMapActions;
};

const layoutConfig = {
  borderRadius: 10,
  itemSize: 40,
  gap: 10,
  axesGap: 20,
};

const AccessibleIcon: React.FC<{ type: SeatType }> = ({ type }) => (type === 'wheelchair' || type === 'wheelchair-companion')
  ? (
    <g transform="translate(3,10)" className={classes.infograph}>
      <circle cx="12" cy="4" r="2" className={classes.infograph} />
      <path
        className={classes.infograph}
        d="
          M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01
          H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2
          h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41
          2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z
        "
      />
      {
        type === 'wheelchair-companion'
          ? <path className={classes.infograph} transform="translate(15, -2) scale(0.8)" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          : null
      }
    </g>
  )
  : null;

const RowNames: React.FC<{ rows: SeatRows[]; left: number }> = ({ rows, left }) => (
  <g transform={`translate(${left},0)`}>
    {rows.map(row => (
      <text
        key={row.rowIndex}
        className={classes.rowName}
        x="0"
        y={(layoutConfig.itemSize + layoutConfig.gap) / 2 + layoutConfig.itemSize * row.rowIndex + layoutConfig.gap * row.rowIndex}
      >
        {row.rowName}
      </text>
    ))}
  </g>
);

const RowSeats: React.FC<AreaProps> = ({ seats, select, unavailableSeats, statuses }) => (
  <g className={classes.area}>
    {seats.rows.map(row => {
      const y = layoutConfig.itemSize * row.rowIndex + layoutConfig.gap * row.rowIndex;

      return (
        <g className={classes.row} key={row.rowIndex}>
          {row.rowSeats.map(seat => {
            const x = layoutConfig.itemSize * seat.columnIndex + layoutConfig.gap * seat.columnIndex;

            return (
              <g
                key={seat.columnIndex}
                className={classnames(classes.seat, {
                  [classes.soldSeat]: unavailableSeats?.[row.rowIndex]?.[seat.columnIndex] === 'sold',
                  [classes.selectedSeat]: statuses?.[row.rowIndex]?.[seat.columnIndex]?.select,
                })}
                onClick={() => select('select', !statuses?.[row.rowIndex]?.[seat.columnIndex]?.select, seat, row)}
                transform={`translate(${x}, ${y})`}
              >
                <path
                  className={classes.seatBackground}
                  d={`
                    M${0},${layoutConfig.itemSize}
                    v-${layoutConfig.itemSize - layoutConfig.borderRadius}
                    q0,-${layoutConfig.borderRadius} ${layoutConfig.borderRadius},-${layoutConfig.borderRadius}
                    h${layoutConfig.itemSize - layoutConfig.borderRadius * 2}
                    q${layoutConfig.borderRadius},0 ${layoutConfig.borderRadius},${layoutConfig.borderRadius}
                    v${layoutConfig.itemSize - layoutConfig.borderRadius}
                    z
                  `}
                />
                <AccessibleIcon type={seat.seatType} />
              </g>
            );
          })}
        </g>
      );
    })}
  </g>
);

const SeatingMapArea: React.FC<AreaProps> = ({ seats, select, statuses, unavailableSeats }) => (
  <>
    <RowNames rows={seats.rows} left={-layoutConfig.axesGap - 8} />
    <RowSeats seats={seats} select={select} statuses={statuses} unavailableSeats={unavailableSeats} />
    <RowNames
      rows={seats.rows}
      left={layoutConfig.itemSize * seats.columnCount + layoutConfig.gap * seats.columnCount - layoutConfig.gap + layoutConfig.axesGap}
    />
  </>
);

export default SeatingMapArea;
