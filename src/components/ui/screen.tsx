import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/providers/theme-provider';
import { screenPadding } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
  /** Espacio extra al final para que la barra de pestañas no tape el contenido. */
  bottomInset?: number;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top'],
  style,
  bottomInset = 24,
}: ScreenProps) {
  const { colors } = useTheme();
  const inner: ViewStyle = {
    paddingHorizontal: padded ? screenPadding : 0,
    paddingBottom: bottomInset,
  };

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, inner]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
