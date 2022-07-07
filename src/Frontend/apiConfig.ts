import { Configuration, DataChannelApi } from 'client';

const baseUrl = process.env.NEXT_PUBLIC_VISTA_LAB_API_URL || 'http://localhost:5052';

const vistaLabConfig = new Configuration({
  basePath: baseUrl,
});

export const VistaLabApi = {
  QueryApi: new DataChannelApi(vistaLabConfig),
};
