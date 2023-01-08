const dgram = require('dgram')
const EMessageType = require('./EMessageType')
const STUNMessage = require('./STUNMessage')


const server = dgram.createSocket('udp4')

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`)
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
    let message = new STUNMessage(msg)
    console.log(message)
});

server.on('listening', () => {
    const address = server.address()
    console.log(`server listening ${address.address}:${address.port}`)
});

server.bind(41234)

let message = new STUNMessage(EMessageType.BindingRequest)

console.log(message, message.encode())

server.send(new Uint8Array(message.encode()), 19302, 'stun.l.google.com')