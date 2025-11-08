import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 16,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  profile: {
    width: 28,
    height: 28,
    marginRight: 16,
  },
  logout: {
    width: 24,
    height: 24,
    tintColor: "#FF3B30",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 16,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  switchLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#334155",
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 8,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  menuItem: {
    width: "47%",
    aspectRatio: 1,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 12,
    textAlign: "center",
    letterSpacing: -0.2,
  },
});

export default styles;