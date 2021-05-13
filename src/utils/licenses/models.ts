export interface License {
  title: string;
  spdxId: string;
  permissions: Permissions<boolean>;
  conditions: Conditions<boolean>;
  limitations: Limitations<boolean>;
  url: string;
}

export interface Permissions<T> {
  commercialUse: T;
  distribution: T;
  modifications: T;
  privateUse: T;
  patentUse: T;
}

export interface Conditions<T> {
  discloseSource: T;
  includeCopyright: T;
  includeCopyrightVSource: T;
  networkUseDisclosure: T;
  sameLicense: T;
  sameLicenseVLibrary: T;
  sameLicenseVFile: T;
  documentChanges: T;
}

export interface Limitations<T> {
  liability: T;
  warranty: T;
  trademarkUse: T;
  patentUse: T;
}

export interface Rights<T> {
  permissions: Permissions<T>;
  conditions: Conditions<T>;
  limitations: Limitations<T>;
}

export enum AlarmLevel {
  CHILL,
  WARN,
  PANIC,
}

