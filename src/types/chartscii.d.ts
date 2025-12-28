declare module 'chartscii' {
  interface ChartData {
    label?: string;
    value: number;
    color?: string;
  }

  interface ChartOptions {
    data?: ChartData[] | number[];
    width?: number;
    height?: number;
    theme?: string;
    color?: string;
    colorLabels?: boolean;
    barSize?: number;
    fill?: string;
    naked?: boolean;
    labels?: boolean;
    percentage?: boolean;
    reverse?: boolean;
    char?: string;
    sort?: boolean;
    title?: string;
    structure?: {
      y?: string;
      x?: string;
    };
  }

  class Chartscii {
    constructor(data?: ChartData[] | number[], options?: ChartOptions);
    create(): string;
  }

  export = Chartscii;
}
