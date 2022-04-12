export class ValidatorBuilder {
    public fn?: () => boolean;
    public format?: (error: string) => string;
    public identifier!: string;
    public groups?: string[];
    public severity?: string;
}