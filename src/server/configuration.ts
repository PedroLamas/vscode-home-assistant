import { DidChangeConfigurationParams } from "vscode-languageserver";
import Uri from 'vscode-uri';

export interface IConfigurationService {
    isConfigured: boolean;
    token?: string;
    url?: string;
    ignoreCertificates: boolean;
    updateConfiguration(config: DidChangeConfigurationParams): void;
}

export interface HomeAssistantConfiguration {
    longLivedAccessToken?: string;
    hostUrl?: string;
    ignoreCertificates: boolean;
}

export class ConfigurationService implements IConfigurationService {
    public isConfigured: boolean = false;
    public token?: string;
    public url?: string;
    public ignoreCertificates: boolean = false;

    constructor() {
        this.setConfigViaEnvironmentVariables();
        
        this.isConfigured = `${this.url}` !== "";
    }

    public updateConfiguration = (config: DidChangeConfigurationParams): void => {
        var incoming = <HomeAssistantConfiguration>config.settings["vscode-home-assistant"];

        this.token = incoming.longLivedAccessToken;
        this.url = this.getUri(incoming.hostUrl);
        this.ignoreCertificates = !!incoming.ignoreCertificates;

        this.setConfigViaEnvironmentVariables();

        this.isConfigured = `${this.url}` !== "";
    }

    private setConfigViaEnvironmentVariables() {
        if (!this.url && process.env.HASS_SERVER) {
            this.url = this.getUri(process.env.HASS_SERVER);
        }
        if (!this.token && process.env.HASS_TOKEN) {
            this.token = process.env.HASS_TOKEN;
        }
    }

    private getUri =(value: string) : string =>{
        if (!value) {
            return "";
        }
        var uri = Uri.parse(value);
        return `${uri.scheme}://${uri.authority}${uri.path.replace(/\/$/, "")}`;
    }
}
