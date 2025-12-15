import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6B8E23', // olive-like green
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    welcomeRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 18,
    },
    letter: {
        fontSize: 44,
        color: '#fff',
        fontWeight: '700',
        marginHorizontal: 2,
        letterSpacing: 1,
    },
    title: {
        marginTop: 8,
        fontSize: 30,
        color: '#fff',
        fontWeight: '800',
        textAlign: 'center',
    },
});
