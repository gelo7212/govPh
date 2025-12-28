export interface CounterDTO {
  type: string;
  year: number;
  month: number;
  seq: number;
  updatedAt?: Date;
}

export interface GeneratedNumber {
  number: string;
  type: string;
  year: number;
  month: number;
  sequence: number;
  generatedAt: Date;
}
