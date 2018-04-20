import React, { Component } from 'react';
import { Platform, Text, View, Modal, Dimensions, TouchableOpacity } from 'react-native';
import uuidv4 from 'uuid/v4';

import styles from './styles';

const { width, height } = Dimensions.get('window');
export default class PreviewVideo extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    render() {
        const { call, type } = this.props;
        const videoMedia = call ? call.getMedia().find(media => media['type'] === 'PJMEDIA_TYPE_VIDEO') : null;
        const isVideo = videoMedia ? true : false;
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
                 
                </View>
            </Modal>
        );
    }
}
