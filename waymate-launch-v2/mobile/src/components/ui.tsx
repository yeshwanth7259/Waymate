import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows } from '../theme/theme';

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
      {icon && <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: 12 }} />}
      <TextInput {...props} placeholderTextColor={colors.mutedLight} style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }]} />
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
  btn: { minHeight: 56, backgroundColor: colors.primary, borderRadius: radius.xxl, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginVertical: 8, ...shadows.glow },
  secondary: { backgroundColor: colors.primarySoft, borderWidth: 0, ...shadows.sm },
  danger: { backgroundColor: colors.red, ...shadows.sm },
  disabled: { opacity: 0.5, ...shadows.sm },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  label: { fontSize: 13, color: colors.navy, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  inputWrap: { minHeight: 56, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '500', paddingVertical: 14 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.md },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.xl, marginBottom: spacing.md, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 22, color: colors.navy2, fontWeight: '800', letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  routeRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  routeDots: { width: 24, alignItems: 'center', marginRight: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { width: 2, height: 24, backgroundColor: colors.border, marginVertical: 2 },
  routeText: { color: colors.text, fontSize: 16, fontWeight: '600', marginVertical: 3 },
  routeTime: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 14, color: colors.muted, fontWeight: '600', fontSize: 15 },
});
