export const sleep = (delay: number) => {
    return new Promise(done => setTimeout(done, delay))
}