export interface Config {
    alias: string;
    token: string;
    url: string;
    name: string;
    type?: 'KEY'| 'TOKEN';
}

export interface CurrentConfig extends Config {
    isActive: boolean;
}