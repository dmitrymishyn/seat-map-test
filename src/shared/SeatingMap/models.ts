export type SeatingMapSeatActions = Record<string, any>;
export type SeatingMapRowActions = Record<string, SeatingMapSeatActions>;
export type SeatingMapActions = Record<string, SeatingMapRowActions>;

export const layoutConfig = {
  borderRadius: 10,
  itemSize: 40,
  gap: 15,

  axes: {
    gap: 20,
    // magic number: width calculated from result...
    width: 10,
  },

  scene: {
    paddingLeft: 20,
    paddingRight: 20,
    curveRadius: 30,
  },
};
