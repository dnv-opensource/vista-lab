import { Configuration, QueryApi, VesselApi } from 'client';

const baseUrl = process.env.NEXT_PUBLIC_VISTA_LAB_API_URL || 'http://localhost:8050';

const vistaLabConfig = new Configuration({
  basePath: baseUrl,
});

export const VistaLabApi = {
  QueryApi: new QueryApi(vistaLabConfig),
  VesselApi: new VesselApi(vistaLabConfig),
};
