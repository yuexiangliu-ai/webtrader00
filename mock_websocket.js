const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });
const tokens = [{ token: 'mockToken123', display_name: 'Mock Token', scopes: ['read', 'trade'] }];
let mockAccountId = 1000;

wss.on('connection', (ws) => {
    console.log('Mock WebSocket client connected');

    ws.on('message', (message) => {
        const request = JSON.parse(message);
        console.log('Received:', request);

        if (request.website_status === 1) {
            ws.send(JSON.stringify({
                website_status: { clients_country: 'us', site_status: 'up' },
                echo_req: request,
                msg_type: 'website_status',
                req_id: request.req_id,
                subscribe: request.subscribe ? 1 : undefined
            }));
        }

        if (request.authorize) {
            const token = request.authorize;
            console.log('Authorizing token:', token);
            ws.send(JSON.stringify({
                authorize: {
                    account_list: [
                        {
                            loginid: `CR${mockAccountId++}`,
                            landing_company_name: 'maltainvest',
                            currency: 'USD',
                            is_virtual: 0,
                            email: 'mock@example.com',
                            country: 'us'
                        }
                    ],
                    loginid: 'CR123',
                    landing_company_name: 'maltainvest',
                    balance: 10000,
                    currency: 'USD',
                    scopes: ['read', 'trade'],
                    email: 'mock@example.com',
                    country: 'us',
                    is_virtual: 0
                },
                echo_req: request,
                msg_type: 'authorize',
                req_id: request.req_id
            }));
            setTimeout(() => {
                ws.send(JSON.stringify({
                    balance: {
                        balance: 10000,
                        currency: 'USD',
                        loginid: 'CR123'
                    },
                    echo_req: { balance: 1 },
                    msg_type: 'balance',
                    req_id: request.req_id ? request.req_id + 1 : undefined
                }));
                ws.send(JSON.stringify({
                    transaction: {
                        action: 'mock',
                        amount: 0
                    },
                    echo_req: { transaction: 1 },
                    msg_type: 'transaction',
                    req_id: request.req_id ? request.req_id + 2 : undefined
                }));
            }, 100);
        }

        if (request.balance === 1) {
            ws.send(JSON.stringify({
                balance: {
                    balance: 10000,
                    currency: 'USD',
                    loginid: 'CR123'
                },
                echo_req: request,
                msg_type: 'balance',
                req_id: request.req_id
            }));
        }

        if (request.transaction === 1) {
            ws.send(JSON.stringify({
                transaction: {
                    action: 'mock',
                    amount: 0
                },
                echo_req: request,
                msg_type: 'transaction',
                req_id: request.req_id
            }));
        }

        if (request.ping === 1) {
            ws.send(JSON.stringify({
                ping: 'pong',
                echo_req: request,
                msg_type: 'ping',
                req_id: request.req_id
            }));
        }

        if (request.forget_all) {
            ws.send(JSON.stringify({
                forget_all: 1,
                echo_req: request,
                msg_type: 'forget_all',
                req_id: request.req_id
            }));
        }

        if (request.active_symbols === 'brief') {
            ws.send(JSON.stringify({
                active_symbols: {
                    active_symbols: [
                        { symbol: 'frxEURUSD', display_name: 'EUR/USD', market: 'forex', pip: '0.0001' }
                    ]
                },
                echo_req: request,
                msg_type: 'active_symbols',
                req_id: request.req_id
            }));
        }

        if (request.trading_times) {
            ws.send(JSON.stringify({
                trading_times: {
                    markets: [
                        {
                            name: 'Forex',
                            submarkets: [
                                {
                                    name: 'Major Pairs',
                                    symbols: [
                                        { symbol: 'frxEURUSD', times: { open: ['00:00'], close: ['23:59'] } }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                echo_req: request,
                msg_type: 'trading_times',
                req_id: request.req_id
            }));
        }

        if (request.landing_company_details) {
            ws.send(JSON.stringify({
                landing_company_details: {
                    name: 'maltainvest',
                    address: ['Mock Address']
                },
                echo_req: request,
                msg_type: 'landing_company_details',
                req_id: request.req_id
            }));
        }

        if (request.get_account_status === 1) {
            ws.send(JSON.stringify({
                get_account_status: {
                    status: ['authenticated'],
                    currency_type: 'real'
                },
                echo_req: request,
                msg_type: 'get_account_status',
                req_id: request.req_id
            }));
        }

        if (request.get_settings === 1) {
            ws.send(JSON.stringify({
                get_settings: {
                    email: 'mock@example.com',
                    country: 'us'
                },
                echo_req: request,
                msg_type: 'get_settings',
                req_id: request.req_id
            }));
        }

        if (request.get_financial_assessment === 1) {
            ws.send(JSON.stringify({
                get_financial_assessment: {},
                echo_req: request,
                msg_type: 'get_financial_assessment',
                req_id: request.req_id
            }));
        }

        if (request.mt5_login_list === 1) {
            ws.send(JSON.stringify({
                mt5_login_list: [],
                echo_req: request,
                msg_type: 'mt5_login_list',
                req_id: request.req_id
            }));
        }

        if (request.get_self_exclusion === 1) {
            ws.send(JSON.stringify({
                get_self_exclusion: {},
                echo_req: request,
                msg_type: 'get_self_exclusion',
                req_id: request.req_id
            }));
        }

        if (request.landing_company) {
            ws.send(JSON.stringify({
                landing_company: {
                    name: 'maltainvest',
                    financial_company: { name: 'maltainvest' }
                },
                echo_req: request,
                msg_type: 'landing_company',
                req_id: request.req_id
            }));
        }
    });

    ws.on('close', () => {
        console.log('Mock WebSocket client disconnected');
    });
});

console.log('Mock WebSocket server running on ws://localhost:8081');