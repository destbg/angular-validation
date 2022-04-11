export function format(str: string, args: any[]): string {
    return str.replace(/{(\d+)}/g, function (match: string, index: number) {
        return typeof args[index] !== 'undefined' ? args[index] : match;
    });
}
