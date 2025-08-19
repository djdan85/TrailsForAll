import React from 'react';
import { FlatList, Text, View, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import i18n from 'i18n-js';

export default function TrailList({ trails }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.trailItem}>
      <Text style={styles.trailName}>{item.name}</Text>
      <Text>{i18n.t('trail.difficulty')}: {item.difficulty}</Text>
      <Text>{i18n.t('trail.length')}: {item.length} km</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.trailList}>
      <FlatList
        data={trails}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}