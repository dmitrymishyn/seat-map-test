import { Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';

import { EventResponse } from './models';

export type HttpOptions = Partial<{ onlyResponse: boolean }>;

const request$ = <T extends object>(
  method: 'get',
  url: string,
  body: BodyInit | null = null,
  { onlyResponse = true }: HttpOptions = {},
): Observable<T> => ajax({
  url: `/api${url}`,
  method,
  body,
  headers: {
    'x-api-key': process.env.REACT_APP_API_KEY,
  },
}).pipe(
  map(response => onlyResponse ? response.response as T : response as T),
);

export const get$ = <T extends object>(url: string, body: BodyInit | null = null, options?: HttpOptions) =>
  request$<T>('get', url, body, options);

export const fetchEventInfo$ = (eventId: number, options?: HttpOptions) =>
  get$<EventResponse>(`/en-us/events/${eventId}`, null, options);
