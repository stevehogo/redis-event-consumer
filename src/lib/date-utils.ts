import day from "dayjs";

export const getDate = (format: string) => day().format(format);
export const getTimeStamp = () => day().format("YYYY-MM-DDTHH:mm:ss.SSS");
export const today = () => day().format("YYYY-MM-DD");
export const time = () => day().valueOf();