import React from 'react';
import { View, Text, FlatList } from 'react-native';
import MapView from 'react-native-maps';
import TrailList from '../components/TrailList';
import { styles } from '../styles';
import i18n from 'i18n-js';
import { en, cs, sk } from '../locales';
import * as Localization from 'expo-localization';

i18n.translations = { en, cs, sk };
i18n.locale = Localization.locale;
i18n.fallbacks = true;

const mockTrails = [
  { id: '1', name: 'Šumava Trail', difficulty: 'Střední', length: 25 },
  { id: '2', name: 'Krkonoše Loop', difficulty: 'Těžká', length: 40 },
  { id: '3', name: 'Tatranská okružná', difficulty: 'Lehká', length: 15 },
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 50.073658, // Praha jako výchozí bod
          longitude: 14.418540,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        provider="google"
      />
      <Text style={styles.title}>{i18n.t('home.title')}</Text>
      <TrailList trails={mockTrails} />
    </View>
  );
}