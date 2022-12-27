export function shuffle<T>(array: T[]): T[] {
    for (let i = 0; i < array.length; i++) {
        const index = Math.floor(Math.random() * i);
        const temp = array[i];

        array[i] = array[index];
        array[index] = temp;
    }

    return array;
}
