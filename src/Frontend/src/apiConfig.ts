import { Configuration, DataChannelApi } from './client';

const baseUrl = process.env.REACT_APP_VISTA_LAB_API_URL || 'http://localhost:5052';

const vistaLabConfig = new Configuration({
  basePath: baseUrl,
});

export const VistaLabApi = {
  DataChannelApi: new DataChannelApi(vistaLabConfig),
};
