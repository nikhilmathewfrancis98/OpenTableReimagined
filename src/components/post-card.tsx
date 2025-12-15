import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type PollOption = { text: string; votes: number };
type Poll = { question: string; options: PollOption[] };

type Post = {
    id?: string;
    restaurantName?: string;
    location?: string;
    media?: { imageUrl?: any };
    badge?: string;
    likesCount?: number;
    description?: string;
    createdAt?: string;
    poll?: Poll | null;
};

type User = { name?: string; username?: string; profilePic?: any };

export default function PostCard({ post, user, onPress }: { post: Post; user: User; onPress?: () => void }) {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [poll, setPoll] = useState<Poll | null>(post.poll ?? null);
    const [voted, setVoted] = useState<number | null>(null);

    const totalVotes = useMemo(() => {
        if (!poll) return 0;
        return poll.options.reduce((acc, o) => acc + (o.votes || 0), 0);
    }, [poll]);

    const handleVote = (index: number) => {
        if (!poll || voted !== null) return;
        const newPoll = JSON.parse(JSON.stringify(poll)) as Poll;
        newPoll.options[index].votes = (newPoll.options[index].votes || 0) + 1;
        setPoll(newPoll);
        setVoted(index);
    };

    const Container: any = onPress ? TouchableOpacity : View;

    return (
        <Container style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.avatarCircle} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user?.name || user?.username || 'User'}</Text>
                    <Text style={styles.muted}>{post.restaurantName}, {post.location}</Text>
                </View>
                <TouchableOpacity onPress={() => { }}>
                    <Text>⋯</Text>
                </TouchableOpacity>
            </View>

            {post.media?.imageUrl ? <Image source={post.media.imageUrl} style={styles.image} /> : null}

            <View style={styles.footer}>
                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.iconBtn}>
                        <Text>{liked ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}><Text>💬</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}><Text>🔗</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setBookmarked(!bookmarked)} style={styles.iconBtn}><Text>{bookmarked ? '🔖' : '📑'}</Text></TouchableOpacity>
                </View>

                <Text style={styles.likes}>{(post.likesCount || 0) + (liked ? 1 : 0)} likes</Text>
                <Text style={styles.description}><Text style={{ fontWeight: '700' }}>{user?.username || user?.name}</Text> {post.description}</Text>
                <Text style={styles.small}>{post.createdAt}</Text>

                {poll && (
                    <View style={styles.pollBox}>
                        <Text style={styles.pollQuestion}>{poll.question}</Text>
                        {poll.options.map((opt, idx) => {
                            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            return (
                                <TouchableOpacity disabled={voted !== null} key={idx} onPress={() => handleVote(idx)} style={styles.pollOption}>
                                    <Text style={styles.pollText}>{opt.text}</Text>
                                    {voted !== null && <Text style={styles.pollText}>{pct}%</Text>}
                                </TouchableOpacity>
                            );
                        })}
                        <Text style={styles.small}>{totalVotes} votes</Text>
                    </View>
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', marginRight: 10 },
    userName: { fontWeight: '700' },
    muted: { color: '#666', fontSize: 12 },
    image: { width: '100%', height: 220, backgroundColor: '#eee' },
    footer: { padding: 12 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconBtn: { marginRight: 12 },
    likes: { fontWeight: '700', marginBottom: 6 },
    description: { fontSize: 14, color: '#111', marginBottom: 6 },
    small: { fontSize: 12, color: '#666' },
    pollBox: { marginTop: 10, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#eee' },
    pollQuestion: { fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    pollOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    pollText: { fontSize: 14 },
});
