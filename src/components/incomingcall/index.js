import React, { Component } from 'react';
import { Platform, Text, View, Modal, Dimensions, TouchableOpacity } from 'react-native';
import uuidv4 from 'uuid/v4';

import styles from './styles';

const { width, height } = Dimensions.get('window');
export default class IncomingCall extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    render() {
        const { incomingCall } = this.props;

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
                    <Text>{incomingCall ? incomingCall._remoteName + ' calling' : 'Incoming Call'}</Text>
                    <TouchableOpacity
                        style={{ marginTop: 10 }}
                        onPress={() => {
                            if (this.props.onAnswerPressed) {
                                this.props.onAnswerPressed(this.props.incomingCall);
                            }
                        }}
                    >
                        <Text>Answer call</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
}
