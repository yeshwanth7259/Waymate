import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

export function Button({ title, onPress, secondary = false, danger = false, disabled = false, icon }: { title: string; onPress: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.btn, secondary && styles.secondary, danger && styles.danger, disabled && styles.disabled, pressed && !disabled && { opacity: 0.88 }]}>
      {icon && <Ionicons name={icon} size={18} color={secondary ? colors.greenDark : colors.white} style={{ marginRight: 8 }} />}
      <Text style={[styles.btnText, secondary && { color: colors.greenDark }, danger && { color: colors.white }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label?: string }) {
  return <Pressable onPress={onPress} accessibilityLabel={label} style={styles.iconButton}><Ionicons name={icon} size={22} color={colors.navy} /></Pressable>;
}

export function Input({ label, icon, ...props }: any) {
  return <View style={{ marginBottom: spacing.md }}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.inputWrap}>
      {icon && <Ionicons name={icon} size={19} color={colors.green} style={{ marginRight: 10 }} />}
      <TextInput {...props} placeholderTextColor="#9AA9B6" style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }]} />
    </View>
  </View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) { return <View style={[styles.card, style]}>{children}</View>; }

export function Badge({ text, tone = 'green', icon }: { text: string; tone?: 'green' | 'blue' | 'amber' | 'red' | 'gray'; icon?: keyof typeof Ionicons.glyphMap }) {
  const map = { green: [colors.greenSoft, colors.greenDark], blue: [colors.blueSoft, colors.blue], amber: [colors.amberSoft, colors.amber], red: [colors.redSoft, colors.red], gray: ['#F1F4F5', colors.muted] } as any;
  return <View style={[styles.badge, { backgroundColor: map[tone][0] }]}>{icon && <Ionicons name={icon} size={13} color={map[tone][1]} style={{ marginRight: 4 }} />}<Text style={{ color: map[tone][1], fontSize: 11, fontWeight: '800' }}>{text}</Text></View>;
}

export function SectionTitle({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeader}><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{title}</Text>{subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}</View>{action && <Pressable onPress={onAction}><Text style={styles.link}>{action}</Text></Pressable>}</View>;
}

export function RouteRow({ from, to, time }: { from: string; to: string; time?: string }) {
  return <View style={styles.routeRow}>
    <View style={styles.routeDots}><View style={[styles.dot, { backgroundColor: colors.green }]} /><View style={styles.routeLine} /><View style={[styles.dot, { backgroundColor: colors.navy }]} /></View>
    <View style={{ flex: 1 }}><Text style={styles.routeText}>{from}</Text><Text style={styles.routeText}>{to}</Text></View>
    {time && <Text style={styles.routeTime}>{time}</Text>}
  </View>;
}

export function Loading({ label = 'Loading WayMate…' }: { label?: string }) { return <View style={styles.loading}><ActivityIndicator size="large" color={colors.green} /><Text style={styles.loadingText}>{label}</Text></View>; }

export const styles = StyleSheet.create({
  btn: { minHeight: 50, backgroundColor: colors.green, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginVertical: 5 },
  secondary: { backgroundColor: colors.greenSoft, borderWidth: 1, borderColor: '#BEE6CF' },
  danger: { backgroundColor: colors.red },
  disabled: { opacity: 0.45 },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  label: { fontSize: 12, color: colors.muted, fontWeight: '800', marginBottom: 7 },
  inputWrap: { minHeight: 52, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600', paddingVertical: 13 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 20, color: colors.navy, fontWeight: '900' },
  sectionSubtitle: { fontSize: 12, color: colors.muted, marginTop: 3 },
  link: { color: colors.greenDark, fontWeight: '900', fontSize: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', minHeight: 58 },
  routeDots: { width: 20, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1, height: 20, backgroundColor: colors.border },
  routeText: { color: colors.text, fontSize: 14, fontWeight: '700', marginVertical: 2 },
  routeTime: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 10, color: colors.muted, fontWeight: '700' },
});
