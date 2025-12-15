import React from 'react';
import { Text } from 'react-native';

// Simple icon placeholders. Replace with react-native-svg or vector icons as needed.
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
    return <Text style={{ fontSize: size }}>{name}</Text>;
}

export default Icon;
