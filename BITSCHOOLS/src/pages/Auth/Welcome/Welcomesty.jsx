import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    safeContainer: {
        flex: 1,
    },
    container: {
        flexGrow: 1,  
        justifyContent: "center", 
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    contentWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        gap: 15,
    },
    decorativeLine: {
        width: 30,
        height: 3,
        backgroundColor: '#2842C4',
        borderRadius: 2,
    },
    title: {
        fontFamily: "DMSans-Regular",
        color: "#2842C4",
        fontSize: 32,
        fontWeight: "900",
        textAlign: "center",
        letterSpacing: 2,
        textShadowColor: 'rgba(40, 66, 196, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    imageContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    imageShadow: {
        shadowColor: '#2842C4',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    image: {
        resizeMode: "contain",
        alignSelf: "center",
    },
    textSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    mainText: {
        color: "#1A1A1A",
        letterSpacing: 1,
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
    },
    text2: {
        color: "#4A5E6D",
        fontSize: 16,
        fontWeight: "500",
        letterSpacing: 0.5,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
        lineHeight: 24,
    },
    featuresList: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E3E8EF',
    },
    featureText: {
        color: '#4A5E6D',
        fontSize: 13,
        fontWeight: '600',
    },
    btn: {
        width: 240,
        height: 56,
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 28,
        shadowColor: '#2842C4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    btntext: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1.5,
    },
    pressablebtn: {
        marginTop: 20,
        alignSelf: "center",
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    dotIndicator: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    dotActive: {
        backgroundColor: '#2842C4',
        width: 24,
    },
});

export default styles;
