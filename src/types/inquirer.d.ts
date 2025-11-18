declare module 'inquirer' {
  export interface Question {
    type: string;
    name: string;
    message: string;
    default?: any;
    choices?: any[];
  }

  export function prompt(questions: Question[]): Promise<any>;
}
