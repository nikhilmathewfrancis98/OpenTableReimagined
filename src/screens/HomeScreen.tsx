import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import useCollection from '../firebase/firestore/use-collection';
import PostCard from '../components/post-card';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 10;

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { data: posts, loading, error, refresh, loadMore, hasMore } = useCollection('posts', { pageSize: PAGE_SIZE, orderBy: 'createdAt' });
    const [refreshing, setRefreshing] = useState(false);

    const onEndReached = useCallback(() => {
        if (!hasMore) return;
        loadMore();
    }, [hasMore, loadMore]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    if (loading && (!posts || posts.length === 0)) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Error loading feed.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item: any) => item.id || String(Math.random())}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        user={{ username: item.author || 'anon' }}
                        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                    />
                )}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={<Text style={styles.empty}>No posts yet</Text>}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 12 }} /> : null}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f6f6' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    error: { color: 'red' },
    empty: { textAlign: 'center', marginTop: 24, color: '#666' },
});
