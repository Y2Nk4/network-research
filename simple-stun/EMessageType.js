//       0x0001  :  Binding Request
//       0x0101  :  Binding Response
//       0x0111  :  Binding Error Response
//       0x0002  :  Shared Secret Request
//       0x0102  :  Shared Secret Response
//       0x0112  :  Shared Secret Error Response

module.exports = {
    BindingRequest: 0x0001,
    0x0001: 'BindingRequest',
    BindingResponse: 0x0101,
    0x0101: 'BindingResponse',
    BindingErrorResponse: 0x0111,
    0x0111: 'BindingErrorResponse',
    SharedSecretRequest: 0x0002,
    0x0002: 'SharedSecretRequest',
    SharedSecretResponse: 0x0102,
    0x0102: 'SharedSecretResponse',
    SharedSecretErrorResponse: 0x0112,
    0x0112: 'SharedSecretErrorResponse',
}