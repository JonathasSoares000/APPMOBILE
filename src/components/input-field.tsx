import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
};

export function InputField({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedView type="background" style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor="#94A3B8"
          style={[styles.input, style]}
          {...props}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: '#0F172A',
    minHeight: 40,
  },
});
