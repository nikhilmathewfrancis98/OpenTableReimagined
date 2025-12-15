import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    View,
    Dimensions,
} from 'react-native';
import styles from './SplashScreen.styles';

const { width } = Dimensions.get('window');

type Props = {
    onDone?: () => void;
};

 const  SplashScreen = ({ onDone }: Props) => {
    const welcome = 'Welcome';
    const letters = welcome.split('');
    const anims = useRef(letters.map(() => new Animated.Value(0))).current;
    const [showTitle, setShowTitle] = useState(false);
    const titleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const letterAnimations = letters.map((_, i) =>
            Animated.timing(anims[i], {
                toValue: 1,
                duration: 450,
                delay: i * 110,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        );

        Animated.stagger(60, letterAnimations).start(() => {
            setShowTitle(true);
            Animated.sequence([
                Animated.timing(titleAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.out(Easing.back(1)),
                    useNativeDriver: true,
                }),
                Animated.delay(800),
            ]).start(() => {
                setTimeout(() => onDone && onDone(), 250);
            });
        });
    }, [anims, letters, onDone, titleAnim]);

    return (
        <View style={styles.container}>
            <View style={styles.welcomeRow}>
                {letters.map((ch, i) => {
                    const translateY = anims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                    });
                    const opacity = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

                    return (
                        <Animated.Text
                            key={`${ch}-${i}`}
                            style={[
                                styles.letter,
                                { transform: [{ translateY }], opacity },
                            ]}>
                            {ch}
                        </Animated.Text>
                    );
                })}
            </View>

            {showTitle && (
                <Animated.Text
                    accessibilityRole="header"
                    style={[
                        styles.title,
                        {
                            transform: [
                                {
                                    scale: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
                                },
                                {
                                    translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                                },
                            ],
                            opacity: titleAnim,
                        },
                    ]}>
                    Open Table
                </Animated.Text>
            )}
        </View>
    );
}

export default SplashScreen;
