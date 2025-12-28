declare module 'asciichart' {
  interface PlotOptions {
    height?: number;
    padding?: string;
    format?: (x: number, i?: number) => string;
    min?: number;
    max?: number;
    offset?: number;
    colors?: number[];
  }

  function plot(data: number[] | number[][], options?: PlotOptions): string;

  export = { plot };
}
