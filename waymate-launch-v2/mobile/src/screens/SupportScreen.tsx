import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { Badge, Button, Card, Input } from '../components/ui';
import { assistantApi } from '../api/services';
import { colors } from '../theme/theme';

const SUPPORT = '+91 7259335286';
type Message = { role: 'user' | 'assistant'; content: string };

export default function SupportScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, I’m the WayMate support assistant. Ask about bookings, verification, safety, or direct driver payments.' },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const call = () => Linking.openURL('tel:+917259335286');
  const send = async () => {
    const content = question.trim();
    if (!content || loading) return;
    const next = [...messages.slice(-9), { role: 'user' as const, content }];
    setMessages(next);
    setQuestion('');
    setLoading(true);
    try {
      const result = await assistantApi.support(next);
      const reply: Message = { role: 'assistant', content: result.answer };
      setMessages(current => [...current, reply].slice(-12));
    } catch (error: any) {
      const reply: Message = { role: 'assistant', content: `I couldn't reach the support assistant: ${error.message}` };
      setMessages(current => [...current, reply].slice(-12));
    } finally {
      setLoading(false);
    }
  };

  return <View style={s.root}>
    <AppHeader title="Help & Support" subtitle="WayMate support and safety" navigation={navigation} showBack />
    <ScrollView contentContainerStyle={s.content}>
      <Card style={s.hero}>
        <View style={s.icon}><Ionicons name="headset" size={28} color={colors.greenDark}/></View>
        <Text style={s.title}>WayMate AI support</Text>
        <Text style={s.copy}>Ask about common product flows. The assistant cannot access your account or change a booking.</Text>
        <View style={s.chat}>
          {messages.map((message, index) => <View key={`${index}-${message.role}`} style={[s.bubble, message.role === 'user' ? s.userBubble : s.assistantBubble]}>
            <Text style={[s.bubbleText, message.role === 'user' && s.userText]}>{message.content}</Text>
          </View>)}
          {loading && <Text style={s.loading}>WayMate is replying…</Text>}
        </View>
        <Input label="YOUR QUESTION" icon="chatbubble-ellipses-outline" multiline value={question} onChangeText={setQuestion} placeholder="How do ride requests work?" maxLength={2000} />
        <Button title={loading ? 'Sending…' : 'Ask support'} icon="send" disabled={loading || !question.trim()} onPress={send} />
        <Text style={s.disclaimer}>AI answers can be incomplete. Never share OTPs, passwords, or payment credentials.</Text>
      </Card>
      <Card>
        <Badge text="Emergency" tone="red" icon="alert-circle"/>
        <Text style={s.sectionTitle}>If you feel unsafe during a trip</Text>
        <Text style={s.copy}>Use the SOS button in the active-trip screen and contact local emergency services when there is immediate danger. WayMate support is not a substitute for emergency services.</Text>
        <Pressable style={s.linkRow} onPress={() => navigation.navigate('Safety')}>
          <Ionicons name="shield-checkmark" size={20} color={colors.greenDark}/><Text style={s.link}>Open Safety Centre</Text><Ionicons name="chevron-forward" size={18} color={colors.muted}/>
        </Pressable>
      </Card>
      <Card>
        <Text style={s.sectionTitle}>Need a person?</Text>
        <Button title="Call WayMate Support" icon="call" secondary onPress={call} />
        <Text style={s.number}>{SUPPORT}</Text>
      </Card>
    </ScrollView>
  </View>;
}

const s=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.bg},
  content:{padding:16,paddingBottom:40},
  hero:{padding:20},
  icon:{width:56,height:56,borderRadius:18,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},
  title:{fontSize:25,fontWeight:'900',color:colors.navy,marginTop:16},
  copy:{fontSize:13,lineHeight:20,color:colors.muted,marginTop:8},
  chat:{gap:8,marginVertical:18},
  bubble:{padding:12,borderRadius:16,maxWidth:'90%'},
  userBubble:{alignSelf:'flex-end',backgroundColor:colors.greenDark},
  assistantBubble:{alignSelf:'flex-start',backgroundColor:colors.bg,borderWidth:1,borderColor:colors.border},
  bubbleText:{fontSize:13,lineHeight:19,color:colors.text},
  userText:{color:colors.white},
  loading:{fontSize:12,color:colors.muted},
  disclaimer:{fontSize:11,lineHeight:16,color:colors.muted,textAlign:'center',marginTop:8},
  number:{textAlign:'center',fontWeight:'900',color:colors.navy,marginTop:8},
  sectionTitle:{fontSize:18,fontWeight:'900',color:colors.navy,marginTop:12},
  linkRow:{marginTop:16,padding:13,borderRadius:14,backgroundColor:colors.greenPale,flexDirection:'row',alignItems:'center',gap:9},
  link:{flex:1,color:colors.greenDark,fontWeight:'900'},
});
