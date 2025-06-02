import { StyleSheet, Text, View } from 'react-native'
import React, { Component } from 'react'
import NodataImg from '../../assets/Genreal/nodata.svg'

export class Nodata extends Component {
    render() {
        return (
            <View style={styles.img}>
                <NodataImg />
                <Text style={styles.imgtext}>No data found</Text>
            </View>
        )
    }
}

export default Nodata

const styles = StyleSheet.create({
    img: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    imgtext: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
    },
})