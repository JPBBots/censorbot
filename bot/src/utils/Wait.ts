export default async (time: number): Promise<true> => await new Promise((resolve) => setTimeout(() => resolve(true), time))
