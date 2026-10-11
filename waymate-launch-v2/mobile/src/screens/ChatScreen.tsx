import React, {useEffect, useState} from 'react';
import {Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import AppHeader from '../components/AppHeader';
import {chatApi} from '../api/services';
import {joinTrip} from '../services/socket';
import {useAuth} from '../auth/AuthContext';
import {colors} from '../theme/theme';

export default function ChatScreen({route, navigation}: any) {
  const {profile} = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let off: (() => void) | undefined;
    chatApi.list(route.params.tripId).then(setMessages).catch(e => Alert.alert('Chat unavailable', e.message));
    joinTrip(route.params.tripId, {
      update: () => {},
      status: () => {},
      chat: (message) => setMessages(items => items.some(item => item.id === message.id) ? items : [...items, message]),
    }).then(cleanup => { off = cleanup; }).catch(() => {});
    return () => off?.();
  }, [route.params.tripId]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const message = await chatApi.send(route.params.tripId, text.trim());
      setMessages(items => items.some(item => item.id === message.id) ? items : [...items, message]);
      setText('');
    } catch (e: any) {
      Alert.alert('Message failed', e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={s.root}>
      <AppHeader title="Trip chat" subtitle="Keep contact inside WayMate" navigation={navigation} showBack />
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          renderItem={({item}) => (
            <View style={[s.bubble, item.senderId === profile?.id ? s.mine : s.theirs]}>
              <Text style={[s.name, item.senderId === profile?.id && {color: '#DDF7E8'}]}>{item.sender?.firstName || 'Participant'}</Text>
              <Text style={[s.body, item.senderId === profile?.id && {color: '#fff'}]}>{item.body}</Text>
              <Text style={[s.time, item.senderId === profile?.id && {color: '#CBEBD8'}]}>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={s.empty}>No messages yet. Say hello before the trip.</Text>}
        />
        <View style={s.composer}>
          <TextInput value={text} onChangeText={setText} placeholder="Write a message…" placeholderTextColor="#8A969C" style={s.input} maxLength={1000} />
          <Pressable onPress={send} style={s.send}><Text style={s.sendText}>{sending ? '…' : 'Send'}</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg}, list: {padding: 16, paddingBottom: 20},
  bubble: {maxWidth: '82%', padding: 11, borderRadius: 16, marginBottom: 9, backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border},
  mine: {alignSelf: 'flex-end', backgroundColor: colors.navy, borderColor: colors.navy}, theirs: {alignSelf: 'flex-start'},
  name: {fontSize: 9, fontWeight: '900', color: colors.greenDark}, body: {fontSize: 13, lineHeight: 18, color: colors.navy, marginTop: 3},
  time: {fontSize: 8, color: colors.muted, marginTop: 5, textAlign: 'right'}, empty: {textAlign: 'center', color: colors.muted, marginTop: 40},
  composer: {flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff', gap: 8},
  input: {flex: 1, minHeight: 44, maxHeight: 100, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 14, color: colors.navy},
  send: {paddingHorizontal: 16, borderRadius: 15, backgroundColor: colors.green, justifyContent: 'center'}, sendText: {color: '#fff', fontWeight: '900'}
});
