import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useDoc from '../firebase/firestore/use-doc';
import PostCard from '../components/post-card';

export default function PostDetailScreen() {
    const route: any = useRoute();
    const { postId } = route.params || {};

    const { data: post, isLoading, error } = useDoc(postId);

    if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;
    if (error) return <View style={styles.center}><Text>Error loading post.</Text></View>;
    if (!post) return <View style={styles.center}><Text>Post not found.</Text></View>;

    return (
        <ScrollView contentContainerStyle={{ padding: 12 }}>
            <PostCard post={post as any} user={{ username: (post as any).author || 'anon' }} />
            <View style={{ marginTop: 12 }}>
                <Text style={styles.title}>Full description</Text>
                <Text style={styles.body}>{(post as any).description}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
    body: { fontSize: 14, color: '#222' },
});
