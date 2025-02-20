import os from 'os'

const getLocalIP = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                console.log(address.address);
                return address.address;
            }
        }
    }
    return 'Not found Local IP';
};
// getLocalIP();
export default getLocalIP