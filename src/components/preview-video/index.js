import React, { Component } from 'react';
import { Platform, Text, View, Modal, Dimensions, TouchableOpacity } from 'react-native';
import { Endpoint } from 'react-native-pjsip';
import uuidv4 from 'uuid/v4';
import { PreviewVideoView, RemoteVideoView } from 'react-native-pjsip';

import styles from './styles';

const { width, height } = Dimensions.get('window');
export default class PreviewVideo extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    render() {
        const { call } = this.props;
        const videoMedia = call ? call.getMedia().find(media => media['type'] === 'PJMEDIA_TYPE_VIDEO') : null;
        console.log('Preview video: ', videoMedia);
        return (
            <Modal
                onRequestClose={() => {
                    if (this.props.onRequestClose) {
                        this.props.onRequestClose();
                    }
                }}
                transparent
                animationType={'slide'}
                visible={this.props.visible}
            >
                <View style={styles.container}>
                    <RemoteVideoView
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#333' }}
                        windowId={videoMedia ? videoMedia.videoStream.windowId : ''}
                        objectFit="contain"
                    />
                    <PreviewVideoView
                        style={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            width: 96,
                            height: 96,
                            backgroundColor: '#000'
                        }}
                        deviceId={videoMedia ? videoMedia.videoStream.captureDevice : ''}
                        objectFit="contain"
                    />

                    <View
                        style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 0,
                            right: 0,
                            backgroundColor: 'transparent',
                            alignItems: 'center'
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                if (this.props.onEndCallPressed) {
                                    this.props.onEndCallPressed(call);
                                }
                            }}
                        >
                            <Text>End call</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}
