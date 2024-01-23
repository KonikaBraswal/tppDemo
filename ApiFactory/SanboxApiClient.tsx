import axios, { AxiosResponse } from "axios";
import config from "../configs/config.json";
import sandboxConfig from "../configs/Sandbox.json";
import { Linking } from "react-native";

interface BodyData {
  Data: {
    Permissions: string[];
  };
  Risk: {}; // Adjust this if Risk has a specific structure
}

interface ResponseData {
  access_token: string;
  Data?: {
    ConsentId?: string;
  };
}

class SanboxApiClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private commonHeaders: any; // Replace 'any' with the actual type of commonHeaders
  private permissions: string[] = [];

  constructor(baseUrl: string, clientId: string, clientSecret: string, commonHeaders: any) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.commonHeaders = commonHeaders;
  }

  async retrieveAccessToken(permission: string[]): Promise<string> {
    this.permissions = permission;

    try {
      const body: Record<string, string> = {
        grant_type: sandboxConfig.grant_type,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: sandboxConfig.scope,
      };
      const headers = { ...this.commonHeaders };

      const response: AxiosResponse<ResponseData> = await axios.post(
        `${this.baseUrl}/${sandboxConfig.tokenEndpoint}`,
        null,
        {
          headers: headers,
          params: body,
        }
      );

      return this.accountRequest(response.data.access_token);
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  }

  async accountRequest(accessToken: string): Promise<string> {
    try {
      const body: BodyData = {
        Data: {
          Permissions: this.permissions,
        },
        Risk: {},
      };
      const headers = {
        ...this.commonHeaders,
        Authorization: "Bearer " + accessToken,
      };

      const response: AxiosResponse<ResponseData> = await axios.post(
        `${this.baseUrl}/${sandboxConfig.accountRequestEndpoint}`,
        body,
        {
          headers: headers,
        }
      );

      return this.userConsent(response.data.Data?.ConsentId || "");
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  }

  async userConsent(consentId: string): Promise<string> {
    let consentUrlWithVariables = `${sandboxConfig.consentUrl}?client_id=${config.clientId}&response_type=code id_token&scope=openid accounts&redirect_uri=${sandboxConfig.redirectUri}&request=${consentId}`;
    console.log(consentUrlWithVariables);

    try {
      await Linking.openURL(consentUrlWithVariables);

      // if (supported) {
      //   await Linking.openURL(consentUrlWithVariables);
      // } else {
      //   console.error("Cannot open the link");
      // }
    } catch (error) {
      console.error("Error opening the link:", error);
    }

    return consentUrlWithVariables;
  }

  async exchangeAccessToken(authToken: string): Promise<string> {
    try {
      const body: Record<string, string> = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: sandboxConfig.redirectUri,
        grant_type: "authorization_code",
        code: authToken,
      };
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      const response: AxiosResponse<ResponseData> = await axios.post(
        `${this.baseUrl}/${sandboxConfig.tokenEndpoint}`,
        null,
        {
          headers: headers,
          params: body,
        }
      );

      console.log("Api access token", response.data.access_token);

      return this.fetchAccounts(response.data.access_token);
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  }

  async fetchAccounts(apiAccessToken: string): Promise<any> {
    try {
      const headers = {
        ...this.commonHeaders,
        Authorization: `Bearer ${apiAccessToken}`,
      };

      const accountResponse: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/${sandboxConfig.accountsEndpoint}`,
        {
          headers: headers,
        }
      );

      return accountResponse.data.Data;
    } catch (error) {
      throw new Error(`Failed to fetch data for accounts: ${error}`);
    }
  }
}

export default SanboxApiClient;
