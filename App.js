import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, set, onValue } from 'firebase/database';

import { FIREBASE_DATABASE_URL, FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID } from '@env';

export default function App() {
	const [product, setProduct] = React.useState('');
	const [amount, setAmount] = React.useState('');
	const [present, setPresent] = React.useState([]);

	const [app, setApp] = React.useState(null);
	const [database, setDatabase] = React.useState(null);

	React.useEffect(() => {
		if (app === null) {
			setApp(initializeApp({
				apiKey: FIREBASE_API_KEY,
				authDomain: FIREBASE_AUTH_DOMAIN,
				databaseURL: FIREBASE_DATABASE_URL,
				projectId: FIREBASE_PROJECT_ID,
				storageBucket: FIREBASE_STORAGE_BUCKET,
				messagingSenderId: FIREBASE_MESSAGING_SENDER_ID
			}));
		}
		else {
			const db = getDatabase(app);

			setDatabase(db);

			onValue(ref(db, 'items/'), snapshot => {
				const data = snapshot.val();

				console.log('11', data, data === null, typeof (data), toString(data));
				if (data === null) {
					// I don't get it
					// WHY
					// WHY DOES IT KEEP ERRORING ON OBJECT.KEYS DUE TO DATA BEING NULL EVEN WHEN IT SHOULDN'T EVEN BOTHER WITH EXECUTING IT
					// WHY EXPO WHY
					console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
				} else {
					const arr = Object.keys(data).map(i => ({
						id: i,
						amount: data[i].amount,
						product: data[i].product
					}));

					setPresent(arr);
				}
			});
		}


	}, [app]);

	if (app === null || database === null) {
		return <View />
	}

	// Dirty, disgusting hacks to get this to work nicely

	const onAdd = () => {
		push(ref(database, 'items/'), { 'product': product, 'amount': amount });
	};

	const onDelete = id => {
		set(ref(database, `items/${id}`), null);
	};

	const keyExtractor = i => i.id;

	const renderItem = ({ item }) => {
		return <View style={{ flexDirection: 'row' }}>
			<Text style={{ marginRight: '5%' }}>{item.product}, {item.amount}</Text>
			<Text style={{ color: 'red' }} onPress={() => onDelete(item.id)}>Bought</Text>
		</View>
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={{ borderColor: 'black', borderWidth: 2, width: '50%', marginTop: '25%' }}
				placeholder='Product'
				onChangeText={text => setProduct(text)}
				value={product}
			/>

			<TextInput
				style={{ borderColor: 'black', borderWidth: 2, width: '50%', marginTop: '5%' }}
				placeholder='Amount'
				onChangeText={text => setAmount(text)}
				value={amount}
			/>

			<Button title='Save' onPress={() => onAdd()} />

			<FlatList
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				data={present}
			/>

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
