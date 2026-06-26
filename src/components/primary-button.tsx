import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, secondary, style }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? theme.backgroundSelected : theme.brand,
          opacity: pressed ? 0.8 : 1,
          borderColor: secondary ? theme.textSecondary : 'transparent',
        },
        style,
      ]}>
      <ThemedText
        type="default"
        style={[styles.label, { color: secondary ? theme.text : '#ffffff' }]}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
