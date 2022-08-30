import * as Clients from './client';

const baseUrl = process.env.REACT_APP_VISTA_LAB_API_URL || 'http://localhost:5052';

export const VistaLabApi = new Clients.Client(new Clients.IConfig(), baseUrl);
