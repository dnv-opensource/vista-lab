export class IConfig {
  constructor(private getToken?: { (): Promise<string> }) {}

  async getAuthorization() {
    if (!this.getToken) return null;
    const token = await this.getToken();
    return `Bearer ${token}`;
  }
}

export class AuthorizedApiBase {
  private readonly config: IConfig;

  protected constructor(config: IConfig) {
    this.config = config;
  }

  protected transformOptions = async (options: RequestInit): Promise<RequestInit> => {
    const token = await this.config.getAuthorization();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: token,
      };
    } else {
      options.headers = {
        ...options.headers,
      };
    }
    return options;
  };
}
