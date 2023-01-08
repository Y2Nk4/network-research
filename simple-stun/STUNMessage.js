let EAttributeType = require('./EAttributeType')
let EMessageType = require('./EMessageType')
let crypto = require('crypto')

module.exports = class STUNMessage{
    messageType = 0
    messageTypeString = ''
    messageLength = 0
    attributes = {}
    transactionId

    constructor(messageType, transactionId) {
        if (Buffer.isBuffer(messageType)) {
            return this.constructFromBuffer(messageType)
        }

        this.messageType = messageType
        this.messageTypeString = EMessageType[messageType]

        this.transactionId = transactionId
        if (!this.transactionId) {
            // Generate Transaction ID randomly if not specified
            this.transactionId = Buffer.alloc(16)
            for(let i = 0; i < 4; i++) {
                this.transactionId.writeUInt32BE(Math.floor(Math.random() * 0xffffffff), i * 4)
            }
        }
    }

    constructFromBuffer(buffer) {
        this.messageType = buffer.readUInt16BE()
        this.messageTypeString = EMessageType[this.messageType]

        this.messageLength = buffer.readUInt16BE(2)
        this.transactionId = buffer.slice(4, 20)

        let bytesRead = 20
        while(bytesRead < buffer.length) {
            let typeId = buffer.readUInt16BE(bytesRead)
            let length = buffer.readUInt16BE(bytesRead + 2)
            bytesRead += 4

            if (EAttributeType[typeId]) {
                this.attributes[EAttributeType[typeId]] = buffer.slice(bytesRead, bytesRead + length)
            }
            bytesRead += length
        }
    }

    addAttribute(type, value) {
        this.attributes[EAttributeType[type]] = value
    }

    encode() {
        let headerBuffer = Buffer.alloc(4) // allocate buffer for STUN header (not include transaction id)
        let payloadBuffer = this._encodePayload()
        headerBuffer.writeUInt16BE(this.messageType) // message type

        // message payload length, adds 24 bytes because
        // the message-integrity attribute will not be used
        // to compute the HMAC-SHA1 and will be appended to the
        // payload at the end.
        headerBuffer.writeUInt16BE(payloadBuffer.length + 24, 2)

        let messageBuffer = Buffer.concat([headerBuffer, this.transactionId, payloadBuffer])

        // 11.2.8 MESSAGE-INTEGRITY
        // The text is then padded with zeroes so as to be
        // a multiple of 64 bytes.
        let hmacInput = Buffer.concat([messageBuffer, Buffer.alloc(64 - (messageBuffer.length % 64))]).toString()

        let hmacHash = crypto.createHmac('sha1', this.transactionId.toString())
            .update(hmacInput)
            .digest()

        return Buffer.concat([
            messageBuffer,
            this._encodeSingleAttribute(EAttributeType.MESSAGE_INTEGRITY, hmacHash)
        ])
    }

    _encodePayload() {
        let attrBuffers = []

        Object.keys(this.attributes).forEach((key) => {
            let valueBuffer = Buffer.from(this.attributes[key])

            attrBuffers.push(this._encodeSingleAttribute(key, valueBuffer))
        })

        return Buffer.concat(attrBuffers)
    }

    _encodeSingleAttribute(key, valueBuffer) {
        let attributeBuffer = Buffer.alloc(4)

        let typeId = EAttributeType[key]

        attributeBuffer.writeUInt16BE(typeId)
        attributeBuffer.writeUInt16BE(valueBuffer.length, 2)

        return Buffer.concat([attributeBuffer, valueBuffer])
    }
}