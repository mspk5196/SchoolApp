import { StyleSheet, Text, View } from 'react-native'
import React, { Component } from 'react'
import NodataImg from '../../assets/General/nodata.svg'

export class Nodata extends Component {
    render() {
        const { message, style } = this.props;
        return (
            <View style={[styles.img, style]}>
                <NodataImg width={140} height={120}/>
                <Text style={styles.imgtext}>{message || "No data found"}</Text>
            </View>
        )
    }
}

export default Nodata

const styles = StyleSheet.create({
    img: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    imgtext: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        marginTop: 8,
        textAlign: 'center',
    },
})