import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, AsyncStorage } from 'react-native';
import uuidv4 from 'uuid/v4';
import VoipPushNotification from 'react-native-voip-push-notification';
import RNCallKit from 'react-native-callkit';

import IncomingCall from './src/components/incomingcall';
import PreviewVideo from './src/components/preview-video';

import { registerAccount, answerCall, makeOutgoingCall, endCall } from './src/libs/jssip';

type Props = {};
const getAddress = username => {
    return `<sip:${username}@sip.antisip.com>`;
};

const { width, height } = Dimensions.get('window');
export default class App extends Component<Props> {
    constructor(props) {
        super(props);

        this.state = {
            name: null,
            // username: '4777519303',
            // password: 'r9smvnvwv9jpvn',
            // domain: 'cloudstage.service.ipallover.net',
            // username: '4777519304',
            // password: 'RyV2bmWkS6RWz74Q',
            username: '4777519305',
            password: 'kdtQjxUt3n37RkHk',
            domain: 'webrtc.lumiero.com',
            account: null,
            destination: null,
            incomingCall: null,
            incomingCallVisible: false,
            previewVideoVisible: false,
            iosCallkitUUID: ''
        };

        if (Platform.OS === 'ios') {
            // Initialise RNCallKit
            let options = {
                appName: 'set_test',
                imageName: 'AppIcon'
            };
            try {
                RNCallKit.setup(options);
            } catch (err) {
                console.log('error:', err.message);
            }

            // Add RNCallKit Events
            RNCallKit.addEventListener('didReceiveStartCallAction', this.onRNCallKitDidReceiveStartCallAction);
            RNCallKit.addEventListener('answerCall', this.onRNCallKitPerformAnswerCallAction);
            RNCallKit.addEventListener('endCall', this.onRNCallKitPerformEndCallAction);
            RNCallKit.addEventListener('didActivateAudioSession', this.onRNCallKitDidActivateAudioSession);
        }
    }

    componentWillMount() {
        if (Platform.OS === 'ios') {
            // or anywhere which is most comfortable and appropriate for you
            VoipPushNotification.requestPermissions(); // required

            VoipPushNotification.addEventListener('register', token => {
                // send token to your apn provider server
                console.log('Pushkit token: ', token);
                this.pushkitToken = token;
                AsyncStorage.setItem('voipToken', token);
            });

            VoipPushNotification.addEventListener('notification', notification => {
                // register your VoIP client, show local notification, etc.
                // e.g.

                /* there is a boolean constant exported by this module called
         * 
         * wakeupByPush
         * 
         * you can use this constant to distinguish the app is launched
         * by VoIP push notification or not
         *
         * e.g.
         */
                if (VoipPushNotification.wakeupByPush) {
                    // do something...

                    // remember to set this static variable to false
                    // since the constant are exported only at initialization time
                    // and it will keep the same in the whole app
                    VoipPushNotification.wakeupByPush = false;
                }

                /**
                 * Local Notification Payload
                 *
                 * - `alertBody` : The message displayed in the notification alert.
                 * - `alertAction` : The "action" displayed beneath an actionable notification. Defaults to "view";
                 * - `soundName` : The sound played when the notification is fired (optional).
                 * - `category`  : The category of this notification, required for actionable notifications (optional).
                 * - `userInfo`  : An optional object containing additional notification data.
                 */
                VoipPushNotification.presentLocalNotification({
                    alertBody: 'hello! ' + notification.getMessage()
                });
            });
        }
    }

    componentWillUnmount() {
        if (this.endpoint && this.state.account) {
            this.endpoint.deleteAccount(this.state.account);
        }
    }

    async componentDidMount() {}

    onRNCallKitDidReceiveStartCallAction(data) {
        /*
       * Your normal start call action
       *
       * ...
       *
       */

        let _uuid = uuidv4();
        RNCallKit.startCall(_uuid, data.handle);
        this.setState({
            iosCallkitUUID: _uuid
        });
    }

    onRNCallKitPerformAnswerCallAction(data) {
        /* You will get this event when the user answer the incoming call
       *
       * Try to do your normal Answering actions here
       *
       * e.g. this.handleAnswerCall(data.callUUID);
       */
    }

    onRNCallKitPerformEndCallAction(data) {
        /* You will get this event when the user finish the incoming/outgoing call
       *
       * Try to do your normal Hang Up actions here
       *
       * e.g. this.handleHangUpCall(data.callUUID);
       */
    }

    onRNCallKitDidActivateAudioSession(data) {
        /* You will get this event when the the AudioSession has been activated by **RNCallKit**,
       * you might want to do following things when receiving this event:
       *
       * - Start playing ringback if it is an outgoing call
       */
    }

    // This is a fake function where you can receive incoming call notifications
    onIncomingCall() {
        // Store the generated uuid somewhere
        // You will need this when calling RNCallKit.endCall()
        let _uuid = uuidv4();
        RNCallKit.displayIncomingCall(_uuid, '886900000000');
        this.setState({
            iosCallkitUUID: _uuid
        });
    }

    // This is a fake function where you make outgoing calls
    onOutgoingCall() {
        // Store the generated uuid somewhere
        // You will need this when calling RNCallKit.endCall()
        let _uuid = uuidv4();
        RNCallKit.startCall(_uuid, '886900000000');
        this.setState({
            iosCallkitUUID: _uuid
        });
    }

    // This is a fake function where you hang up calls
    onHangUpCall() {
        // get the _uuid you stored earlier
        RNCallKit.endCall(this.state.iosCallkitUUID);
    }

    createAccount() {
        let uuid = uuidv4();
        let configuration = {
            name: this.state.name,
            username: this.state.username,
            domain: this.state.domain,
            password: this.state.password,
            // proxy: '217.182.190.105:5060;transport=udp',
            // port: 5060,
            transport: 'UDP', // Default TCP
            regServer: null, // Default wildcard
            regTimeout: null, // Default 3600
            // regHeaders: {
            //     'X-Custom-Header': 'Value'
            // }
            // regContactParams: ';unique-device-token-id=' + uuid,
            log: { level: 'debug' },
            debug: true,
            session_timers: true,
            use_preloaded_route: false
        };
        let regContactParams = '';
        if (Platform.OS === 'ios') {
            regContactParams = `;app-id=org.reactjs.native.example.sip-test;pn-voip-tok=${
                this.pushkitToken
            };pn-im-tok=${uuid}`;
        } else {
            regContactParams = ';unique-device-token-id=' + uuid;
        }
        configuration['regContactParams'] = regContactParams;
        console.log(configuration);

        registerAccount(configuration);
    }

    makeCall(endpoint, account, destination) {
        let callSetings = {
            headers: {
                'P-Assserted-Identity': 'Header example',
                'X-UA': 'React native'
            },
            videoCount: 0,
            audioCount: 1,
            type: 'audio'
        };

        const messageSettings = {
            headers: {
                A: 'B',
                C: 'D'
            },
            targetURI: '...',
            contentType: '...',
            body: '...'
        };
    }

    answerCall(endpoint, incomingCall) {
        let options = {};
        this.setState({ incomingCallVisible: false });
    }

    endCall(endpoint, call) {
        this.setState({
            previewVideoVisible: false
        });
    }

    render() {
        const { account } = this.state;
        let isAccountValid =
            account && account._registration && account._registration._statusText === 'OK' ? true : false;
        // let isAccountValid = account && account._registration && account._registration ? true : false;
        return (
            <View style={styles.container}>
                {isAccountValid === false ? (
                    <View style={[styles.container]}>
                        <TextInput
                            style={styles.textinput}
                            placeholder="Name"
                            onChangeText={text => {
                                this.setState({
                                    name: text
                                });
                            }}
                            value={this.state.name}
                        />
                        <TextInput
                            style={styles.textinput}
                            placeholder="Username"
                            onChangeText={text => {
                                this.setState({
                                    username: text
                                });
                            }}
                            value={this.state.username}
                        />
                        <TextInput
                            style={styles.textinput}
                            placeholder="Password"
                            onChangeText={text => {
                                this.setState({
                                    password: text
                                });
                            }}
                            value={this.state.password}
                        />
                        <TextInput
                            style={styles.textinput}
                            placeholder="Domain"
                            onChangeText={text => {
                                this.setState({
                                    domain: text
                                });
                            }}
                            value={this.state.domain}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                this.createAccount(this.endpoint);
                            }}
                        >
                            <Text>Create account</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.container}>
                        <TextInput
                            style={styles.textinput}
                            placeholder="Destination"
                            onChangeText={text => {
                                this.setState({
                                    destination: text
                                });
                            }}
                            value={this.state.destination}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                this.makeCall(this.endpoint, this.state.account, this.state.destination);
                            }}
                        >
                            <Text>Make Call</Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 10 }} />
                        <TouchableOpacity
                            onPress={() => {
                                if (this.endpoint && this.state.account) {
                                    this.endpoint
                                        .deleteAccount(this.state.account)
                                        .then(result => {
                                            console.log('Lougout: ', result);
                                            if (result) {
                                                this.setState({
                                                    account: null
                                                });
                                            }
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                }
                            }}
                        >
                            <Text>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <IncomingCall
                    visible={this.state.incomingCallVisible}
                    incomingCall={this.state.incomingCall}
                    onRequestClose={() => {}}
                    onAnswerPressed={incomingCall => {
                        this.answerCall(this.endpoint, incomingCall);
                    }}
                />

                <PreviewVideo
                    visible={this.state.previewVideoVisible}
                    call={this.state.call}
                    type={this.state.type}
                    onEndCallPressed={call => {
                        this.endCall(this.endpoint, call);
                    }}
                    onRequestClose={() => {}}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        width: width,
        height: height
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    textinput: {
        width: '100%',
        height: 40,
        textAlign: 'center'
    }
});
