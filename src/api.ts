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
    'x-api-key': 'j6iUdH86ty5FhJTcjNs5g3J47xiiauUy75o961O6',
  },
}).pipe(
  map(response => onlyResponse ? response.response as T : response as T),
);

export const get$ = <T extends object>(url: string, body: BodyInit | null = null, options?: HttpOptions) =>
  request$<T>('get', url, body, options);

export const fetchEventInfo$ = (eventId: number, options?: HttpOptions) =>
  get$<EventResponse>(`/en-us/events/${eventId}`, null, options);
