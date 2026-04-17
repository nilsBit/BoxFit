import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    uebungen: '💪',
    fortschritt: '📊',
    progression: '🔥',
  };
  const labels: Record<string, string> = {
    index: 'HOME',
    uebungen: 'ÜBUNGEN',
    fortschritt: 'STATS',
    progression: 'PFAD',
  };

  if (focused) {
    return (
      <View style={styles.activeTab}>
        <Text style={styles.activeIcon}>{icons[name]}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inactiveTab}>
      <Text style={styles.inactiveIcon}>{icons[name]}</Text>
      <Text style={styles.tabLabel} numberOfLines={1}>{labels[name]}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="uebungen"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="uebungen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fortschritt"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="fortschritt" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progression"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="progression" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(28,27,27,0.9)',
    borderTopWidth: 0,
    height: 90,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    position: 'absolute',
    elevation: 0,
  },
  activeTab: {
    backgroundColor: Colors.primaryContainer,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  activeIcon: {
    fontSize: 24,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 60,
  },
  inactiveIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 8,
    letterSpacing: 1,
    color: Colors.onSurface + '99',
    textAlign: 'center',
  },
});
