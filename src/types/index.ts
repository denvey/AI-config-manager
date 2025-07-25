export interface Config {
    alias: string;
    name: string;
    token: string;
    url: string;
}

export interface CurrentConfig extends Config {
    isActive: boolean;
}