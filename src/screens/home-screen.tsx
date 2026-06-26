import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';

const profiles: Array<{ label: string; href: '/motorista' | '/gestor' }> = [
  { label: 'Motorista', href: '/motorista' },
  { label: 'Gestor', href: '/gestor' },
];

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle" style={styles.title}>
          AtendeCorp
        </ThemedText>
        <ThemedText type="default" style={styles.description}>
          Escolha o seu perfil para iniciar o fluxo de viagens corporativas.
        </ThemedText>
        <View style={styles.buttons}>
          {profiles.map((profile) => (
            <Link key={profile.label} href={profile.href} asChild>
              <Pressable style={[styles.profileButton, { backgroundColor: theme.brand }]}>
                <ThemedText type="default" style={styles.profileLabel}>
                  {profile.label}
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: 28,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 20 },
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  description: {
    color: '#475569',
  },
  buttons: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  profileButton: {
    paddingVertical: 18,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
