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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#4A5E6D",
    marginLeft: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 12,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 35,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  menuItem: {
    width: "45%",
    aspectRatio: 1,
    backgroundColor: "#EBEEFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
    marginTop: 13,
  },
});

export default styles;