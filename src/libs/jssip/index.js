// import JsSIP from 'jssip';

// let account = {
//     domain: 'webrtc.lumiero.com:3443',
//     username: '4777519305',
//     password: 'kdtQjxUt3n37RkHk',
//     destination: '4777519304'
// };

// let pcConfig = {
//     // rtcpMuxPolicy: 'negotiate',
//     iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }]
// };

// const OUTGOING_CALL = 'outgoing';
// const INCOMING_CALL = 'incoming';

// let socket = null;
// let ua = null;
// let incomingSession = null;
// let outgoingSession = null;
// let activeSession = null;
// let type = null;

// let localHasVideo = null;
// let canHold = null;

// let localStream = null;
// socket = new JsSIP.WebSocketInterface(`wss://${account.domain}`);

// socket.via_transport = 'auto';

// let defaultConfig = {
//     sockets: [socket],
//     uri: `sip:${account.username}@${account.domain}`,
//     password: account.password,
//     // hackViaTcp: true,
//     // register: true,
//     // registerExpires: 600,
//     // autostart: true,
//     // hackIpInContact: true,
//     // traceSip: true,
//     log: { level: 'debug' },
//     debug: true,
//     session_timers: true,
//     use_preloaded_route: false
// };

// function registerAccount(configuration, callbacks, views) {
//     let config = configuration ? Object.assign(defaultConfig, configuration) : defaultConfig;
//     console.log(config);

//     ua = new JsSIP.UA(config);

//     ua.on('connecting', () => {
//         console.log('UA "connecting" event');
//         if (callbacks.onRegisterConnecting) {
//             callbacks.onRegisterConnecting();
//         }
//     });

//     ua.on('connected', () => {
//         console.log('UA "connected" event');
//         if (callbacks.onRegisterConnected) {
//             callbacks.onRegisterConnected();
//         }
//     });

//     ua.on('disconnected', () => {
//         console.log('UA "disconnected" event');
//     });

//     ua.on('registered', () => {
//         console.log('UA "registered" event');
//         if (callbacks.registered) {
//             callbacks.registered();
//         }
//     });

//     ua.on('unregistered', () => {
//         console.log('UA "unregistered" event');
//         if (callbacks.unregistered) {
//             callbacks.unregistered();
//         }
//     });

//     ua.on('registrationFailed', data => {
//         console.log('UA "registrationFailed" event: ', data);
//     });

//     ua.on('newRTCSession', data => {
//         console.log('UA "newRTCSession" event: ', data);

//         let originator = data.originator;
//         let session = data.session;
//         let request = data.request;
//         type = session._direction;

//         if (originator !== 'local') {
//             if (callbacks.newRTCSession) {
//                 callbacks.newRTCSession(data);
//             }

//             if (activeSession) {
//                 console.log('incoming call replied with 486 "Busy Here"');

//                 session.terminate({
//                     status_code: 486,
//                     reason_phrase: 'Busy Here'
//                 });

//                 activeSession = null;
//                 return;
//             }
//             // console.log('Incoming session: ', session);
//             // console.log('Incoming peer: ', session._connection);
//             // let peerconnection = session._connection;
//             // if (peerconnection) {
//             //     let localStream = peerconnection.getLocalStreams()[0];
//             //     let remoteStream = peerconnection.getRemoteStreams()[0];

//             //     handleRemoteStream(remoteStream, views);

//             //     peerconnection.addEventListener('addstream', event => {
//             //         console.log('peerconnection "addstream" event');
//             //         console.log(event);
//             //         handleRemoteStream(event.stream, views);
//             //     });
//             // }

//             // type = INCOMING_CALL;
//         } else {
//             // type = OUTGOING_CALL;
//             addLocalStreams(session, views);
//         }

//         activeSession = session;

//         // audioPlayer.play('ringing');

//         registerSessionEvents(session, callbacks, views);

//         console.log(request.toString());
//     });

//     ua.start();

//     return ua;
// }

// function makeOutgoingCall(destination, views, callbacks, hasVideo = false) {
//     let eventHandlers = {
//         progress: function(e) {
//             console.log('call is in progress: ', e);
//             console.log(e);
//         },
//         failed: function(e) {
//             console.log('call failed with cause: ' + e);
//             console.log(e);
//         },
//         ended: function(e) {
//             console.log('call ended with cause: ' + e);
//             console.log(e);
//         },
//         confirmed: function(e) {
//             console.log('call confirmed');
//             console.log(e);
//         }
//     };
//     let options = {
//         // eventHandlers: eventHandlers,
//         mediaConstraints: {
//             audio: true,
//             video: true
//         },
//         rtcOfferConstraints: {
//             offerToReceiveAudio: 1,
//             offerToReceiveVideo: 1
//         },
//         pcConfig: pcConfig
//         // headers: {
//         //     'P-Assserted-Identity': 'Header example',
//         //     'X-UA': 'React native'
//         // }
//     };
//     activeSession = ua.call(`sip:${destination}@${account.domain}`, options);
//     type = OUTGOING_CALL;

//     // registerSessionEvents(activeSession, callbacks, views);
//     console.log(activeSession);
//     let peerconnection = activeSession.connection;
//     let localStream = peerconnection.getLocalStreams()[0];
//     let remoteStream = peerconnection.getRemoteStreams()[0];
//     console.log('Local stream: ', localStream);
//     console.log('Remote stream: ', remoteStream);

//     // Handle local stream
//     addLocalStreams(activeSession, views);

//     // If incoming all we already have the remote stream
//     if (remoteStream) {
//         console.log('already have a remote stream');

//         handleRemoteStream(remoteStream, views);
//     }

//     if (activeSession.isEstablished()) {
//         setTimeout(() => {
//             canHold = true;
//         });
//     }

//     // peerconnection.onaddstream = function(evt) {
//     //     console.log('peerconnection "addstream" event');
//     //     console.log(event);
//     //     handleRemoteStream(evt.stream, views);
//     // };

//     peerconnection.addEventListener('addstream', event => {
//         console.log('peerconnection "addstream" event');
//         console.log(event);
//         handleRemoteStream(event.stream, views);
//     });

//     return activeSession;
// }

// function addLocalStreams(session, views) {
//     let peerconnection = session.connection;
//     localStream = peerconnection.getLocalStreams()[0];

//     console.log('Local stream: ', peerconnection.getLocalStreams());
//     // Handle local stream
//     if (localStream && views) {
//         // Clone local stream
//         // let _localClonedStream = localStream.clone();

//         // Display local stream
//         // selfView.srcObject = _localClonedStream;
//         if (views.localVideo) {
//             views.localVideo.srcObject = localStream;
//             views.localVideo.autoplay = true;
//             views.localVideo.muted = true;

//             views.localVideo.play();
//         }

//         setTimeout(() => {
//             if (localStream.getVideoTracks()[0]) localHasVideo = true;
//         }, 1000);
//     }
// }

// function handleRemoteStream(stream, views) {
//     console.log('_handleRemoteStream() [stream:%o]', stream);

//     let remoteVideo = views.remoteVideo;
//     let audioRemote = views.audioRemote;
//     console.log('Remote video: ', remoteVideo);
//     console.log('Remote audio: ', audioRemote);
//     // Display remote stream
//     // remoteVideo.srcObject = stream;
//     if (stream) {
//         if (remoteVideo) {
//             remoteVideo.srcObject = stream;
//             remoteVideo.autoplay = true;
//             remoteVideo.muted = false;

//             remoteVideo.play();

//             let videoTracks = stream.getTracks();
//             console.log('Using video device: ');
//             console.log(videoTracks);
//             console.log('Remote video element: ', remoteVideo);
//             console.log('Remote video element: ', remoteVideo.srcObject);
//         }

//         if (audioRemote) {
//             let audioTracks = stream.getAudioTracks();
//             console.log('Using audio device: ' + audioTracks[0].label);
//             console.log('Remote audio added: ', audioRemote);
//             audioRemote.srcObject = stream;
//             audioRemote.play();
//         }

//         // this._checkRemoteVideo(stream);

//         stream.addEventListener('addtrack', event => {
//             let track = event.track;
//             console.log('Add track: ', event);
//             console.log(remoteVideo);
//             if (remoteVideo && remoteVideo.srcObject !== stream) return;

//             console.log('remote stream "addtrack" event [track:%o]', track);

//             // Refresh remote video
//             if (remoteVideo) remoteVideo.srcObject = stream;
//             if (audioRemote) audioRemote.srcObject = stream;

//             track.addEventListener('ended', () => {
//                 console.log('remote track "ended" event [track:%o]', track);
//             });
//         });

//         stream.addEventListener('removetrack', () => {
//             if (remoteVideo && remoteVideo.srcObject !== stream) return;

//             console.log('remote stream "removetrack" event');

//             // Refresh remote video
//             if (remoteVideo) remoteVideo.srcObject = stream;
//         });
//     }
// }

// function answerCall(session, options) {
//     session.answer({
//         pcConfig: pcConfig
//     });
// }

// function unRegisterAccount(ua) {
//     let options = {
//         all: true,
//         extraHeaders: ['X-Foo: foo', 'X-Bar: bar']
//     };

//     ua.unregister(options);

//     ua = null;
//     activeSession = null;
// }

// function clearLocalStream(session, views) {
//     if (views) {
//         console.log(views.localVideo);
//         if (views.localVideo) {
//             views.localVideo.pause();
//             views.localVideo.src = '';
//             views.localVideo.srcObject = null;
//         }

//         if (views.remoteVideo) {
//             views.remoteVideo.pause();
//             views.remoteVideo.src = '';
//             views.remoteVideo.srcObject = null;
//         }
//     }

//     console.log('Stop local stream: ', localStream);
//     if (localStream) {
//         let tracks = localStream.getTracks();
//         console.log(tracks);
//         if (tracks) {
//             for (let track of tracks) {
//                 track.stop();
//             }
//         }

//         localStream = null;
//     }
// }

// function registerSessionEvents(session, callbacks = {}, views = {}) {
//     session.on('failed', data => {
//         console.log('session failed: ', data);
//         if (callbacks.onSessionFailed) {
//             callbacks.onSessionFailed(data);
//         }

//         clearLocalStream(activeSession, views);

//         setTimeout(() => {
//             activeSession = null;
//         }, 1000);
//     });

//     session.on('ended', data => {
//         console.log('session ended: ', data);
//         if (callbacks.onSessionEnded) {
//             callbacks.onSessionEnded(data);
//         }

//         clearLocalStream(activeSession, views);

//         setTimeout(() => {
//             activeSession = null;
//         }, 1000);
//     });

//     session.on('accepted', data => {
//         console.log('session accepted: ', data);
//         if (callbacks.onSessionAccepted) {
//             callbacks.onSessionAccepted(data);
//         }
//     });

//     session.on('peerconnection', data => {
//         console.log('session peerconnection: ', data);
//         let localStream = data.peerconnection.getLocalStreams()[0];
//         let remoteStream = data.peerconnection.getRemoteStreams()[0];

//         handleRemoteStream(remoteStream, views);

//         data.peerconnection.addEventListener('addstream', event => {
//             console.log('peerconnection "addstream" event');
//             console.log(event);
//             handleRemoteStream(event.stream, views);
//         });
//     });

//     session.on('peerconnection:createofferfailed', data => {
//         console.log('session peerconnection:createofferfailed: ', data);
//     });

//     session.on('peerconnection:createanswerfailed', data => {
//         console.log('session peerconnection:createanswerfailed: ', data);
//     });

//     session.on('connecting', data => {
//         console.log('session connecting: ', data);
//         console.log(data.request.toString());
//         if (callbacks.onSessionConnecting) {
//             callbacks.onSessionConnecting(data);
//         }
//     });

//     session.on('sending', data => {
//         console.log('session sending: ', data);
//         if (callbacks.onSessionSending) {
//             callbacks.onSessionSending(data);
//         }
//     });

//     session.on('progress', data => {
//         console.log('session progress: ', data);
//         if (callbacks.onSessionProgress) {
//             callbacks.onSessionProgress(data);
//         }
//     });

//     session.on('confirmed', data => {
//         console.log('session confirmed: ', data);
//         if (callbacks.onSessionConfirmed) {
//             callbacks.onSessionConfirmed(data);
//         }
//     });

//     session.on('icecandidate', data => {
//         console.log('session icecandidate: ', data);
//     });
// }

// export { registerAccount, answerCall, makeOutgoingCall, unRegisterAccount };
