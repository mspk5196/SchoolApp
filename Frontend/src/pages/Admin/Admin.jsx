import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_URL } from '@env';

const Admin = () => {
    const [coordinators, setCoordinators] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/adminCoordinators`)
            .then(res => res.json())
            .then(data => setCoordinators(data.adminCoordinators))
            .catch(error => console.error(error));
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.container1}>
                <Text style={styles.title}>Admin Details</Text>
                
            </View>
            <View style={styles.container1}>
                <Text style={styles.title}>Coordinators</Text>
                <FlatList
                    data={coordinators}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text>{item.name} - Grade {item.grade_name}</Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    container1: { padding: 10 },
    title: { fontSize: 20, fontWeight: 'bold' },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }
});

export default Admin;
