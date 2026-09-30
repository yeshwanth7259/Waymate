import React,{useEffect,useState} from 'react';
import {Alert,ScrollView,Text,View,Pressable,StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../auth/AuthContext';
import {rideApi,userApi} from '../api/services';
import {Badge,Button,Card,SectionTitle} from '../components/ui';
import AppHeader from '../components/AppHeader';
import {colors, shadows} from '../theme/theme';
import { POPULAR_KARNATAKA_ROUTES } from '../data/karnataka';

export default function HomeScreen({navigation}:any){
  const {profile, appMode}=useAuth(); const [routes,setRoutes]=useState<any[]>([]); const [onboarding,setOnboarding]=useState<any>();
  useEffect(()=>{Promise.all([rideApi.popular(),userApi.onboarding()]).then(([r,o])=>{setRoutes(r);setOnboarding(o)}).catch(()=>{})},[]);
  const verified=profile?.kycStatus==='VERIFIED';
  if (appMode === 'DRIVER') {
    return (
      <View style={s.root}>
        <AppHeader navigation={navigation} showToggle={true} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <View style={s.driverHero}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
              <View>
                <Text style={s.driverGreeting}>Good Morning</Text>
                <Text style={s.driverName}>{profile?.firstName || 'Driver'}</Text>
              </View>
              <View style={s.onlineToggle}>
                <View style={s.onlineDot} />
                <Text style={s.onlineText}>Online</Text>
              </View>
            </View>

            <View style={s.driverStatsRow}>
              <View style={s.driverStatBox}>
                <Text style={s.driverStatLabel}>Today's Trips</Text>
                <Text style={s.driverStatValue}>0</Text>
              </View>
              <View style={s.driverStatBox}>
                <Text style={s.driverStatLabel}>Today's Earnings</Text>
                <Text style={s.driverStatValue}>₹0</Text>
              </View>
            </View>

            <Pressable style={s.driverPrimaryAction} onPress={()=>navigation.navigate('OfferRide')}>
              <Ionicons name="car" size={24} color="#fff" />
              <Text style={s.driverPrimaryActionText}>Offer a Ride</Text>
            </Pressable>
          </View>

          <View style={s.driverQuickActions}>
            {[
              {icon: 'wallet-outline', label: 'Wallet', target: 'Wallet'},
              {icon: 'stats-chart-outline', label: 'Earnings', target: 'Wallet'},
              {icon: 'card-outline', label: 'Payouts', target: 'Wallet'},
              {icon: 'car-outline', label: 'Vehicle', target: 'Profile'}
            ].map(act => (
              <Pressable key={act.label} style={s.quickActionBtn} onPress={() => navigation.navigate(act.target)}>
                <View style={s.quickActionIcon}>
                  <Ionicons name={act.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={s.quickActionLabel}>{act.label}</Text>
              </Pressable>
            ))}
          </View>

          <Card style={s.upcomingRideCard}>
            <Text style={s.upcomingTitle}>Upcoming Ride</Text>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'space-between', marginTop: 10}}>
              <View style={{flexDirection:'row', alignItems:'center', gap: 10}}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={{fontSize: 14, fontWeight: '700', color: colors.navy2}}>No upcoming rides</Text>
              </View>
              <Button title="View" onPress={() => navigation.navigate('MyRides')} />
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return <View style={s.root}><AppHeader navigation={navigation} showToggle={true}/><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
    <View style={s.hero}><Badge text="Bengaluru's trusted commute network" icon="shield-checkmark"/><Text style={s.heroTitle}>Your route. Someone's{`\n`}<Text style={{color:colors.primary}}>already going your way.</Text></Text><Text style={s.heroCopy}>Share your daily commute with verified people, save money, reduce traffic and travel together.</Text>
      <View style={s.heroActions}><Pressable style={s.primaryAction} onPress={()=>navigation.navigate('FindRide')}><Ionicons name="search" size={20} color="#fff"/><Text style={s.primaryActionText}>Find a Ride</Text></Pressable></View>
      <View style={s.stats}><View><Text style={s.statValue}>Save money</Text><Text style={s.statLabel}>Share commute costs</Text></View><View><Text style={s.statValue}>Less traffic</Text><Text style={s.statLabel}>Fewer cars on road</Text></View><View><Text style={s.statValue}>Safer</Text><Text style={s.statLabel}>Verified community</Text></View></View>
    </View>
    {!verified && <Card style={s.kycBanner}><View style={{flex:1}}><Text style={s.bannerTitle}>Complete your verification</Text><Text style={s.bannerCopy}>KYC is required before booking and offering rides under the current launch policy.</Text></View><Button title="Verify" onPress={()=>navigation.navigate('Kyc')} /></Card>}
    <SectionTitle title="Popular routes in Bengaluru" subtitle="Routes with active WayMate rides" action="View all" onAction={()=>navigation.navigate('FindRide')}/>
    {routes.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight:12, paddingBottom: 16, paddingTop: 4}}>{routes.slice(0,6).map((r:any)=><Pressable key={r.route} onPress={()=>navigation.navigate('FindRide',{origin:r.origin,destination:r.destination})} style={s.routeCard}><View style={s.routeIcon}><Ionicons name="car" size={22} color={colors.primary}/></View><Text style={s.routeName}>{r.origin} → {r.destination}</Text><Text style={s.routeMeta}>{r.activeRides} active rides</Text><View style={s.routeFooter}><Text style={s.routeMeta}>{r.avgPrice ? `₹${Math.round(r.avgPrice)} avg` : 'Live pricing'}</Text><Ionicons name="chevron-forward" size={16} color={colors.muted}/></View></Pressable>)}</ScrollView> : <Card><Text style={{color:colors.muted}}>Popular routes will appear here as real rides are published.</Text></Card>}
    <SectionTitle title="WayMate across Karnataka" subtitle="Start with Bengaluru and search routes across the state"/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight:16, paddingBottom: 8, paddingTop: 4}}>{POPULAR_KARNATAKA_ROUTES.slice(0,8).map(([a,b])=><Pressable key={a+b} onPress={()=>navigation.navigate('FindRide',{origin:a,destination:b})} style={s.stateRoute}><Ionicons name="navigate" size={18} color={colors.primary}/><Text style={s.stateRouteText}>{a} → {b}</Text></Pressable>)}</ScrollView><Pressable style={s.supportRow} onPress={()=>navigation.navigate('Support')}><View style={s.supportIcon}><Ionicons name="headset" size={22} color={colors.primary}/></View><View style={{flex:1}}><Text style={s.supportTitle}>Need help?</Text><Text style={s.supportCopy}>WayMate support · +91 7259335286</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable><SectionTitle title="How WayMate works" subtitle="A better commute in a few simple steps"/>
    <View style={s.steps}>{[['search','Find a ride'],['shield-checkmark','Choose a verified match'],['ticket','Book your seat'],['navigate','Travel together']].map(([icon,title],i)=><View key={title} style={s.step}><View style={s.stepIcon}><Ionicons name={icon as any} size={22} color={colors.primary}/></View><Text style={s.stepNo}>0{i+1}</Text><Text style={s.stepTitle}>{title}</Text></View>)}</View>
    <Card style={s.safetyCard}><View style={{flex:1}}><Badge text="SAFETY FIRST" icon="shield-checkmark" tone="blue"/><Text style={s.safetyTitle}>Verified people. Verified vehicles. Live trips.</Text><Text style={[s.bannerCopy, {color: colors.primarySoft}]}>Women Safety Mode, KYC, RC and insurance checks, emergency contacts, trip sharing and SOS are part of the launch flow.</Text><Button secondary title="Open Safety Centre" icon="shield-checkmark" onPress={()=>navigation.navigate('Safety')}/></View></Card>
  </ScrollView></View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},content:{paddingBottom:40},hero:{padding:24,backgroundColor:colors.white,...shadows.sm, zIndex: 1},heroTitle:{fontSize:34,lineHeight:40,fontWeight:'900',color:colors.navy2,marginTop:20,letterSpacing:-.5},heroCopy:{fontSize:15,lineHeight:22,color:colors.muted,marginTop:14},heroActions:{flexDirection:'row',gap:12,marginTop:24},primaryAction:{flex:1,minHeight:56,borderRadius:30,backgroundColor:colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,...shadows.glow},primaryActionText:{color:'#fff',fontWeight:'800',fontSize:16},secondaryAction:{flex:1,minHeight:56,borderRadius:30,backgroundColor:colors.primarySoft,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,...shadows.sm},secondaryActionText:{color:colors.primary,fontWeight:'800',fontSize:16},stats:{flexDirection:'row',justifyContent:'space-between',marginTop:26,paddingTop:20,borderTopWidth:1,borderTopColor:colors.border},statValue:{fontWeight:'900',color:colors.navy2,fontSize:14},statLabel:{color:colors.muted,fontSize:11,marginTop:4},kycBanner:{margin:20,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:colors.primaryPale},bannerTitle:{fontSize:16,fontWeight:'900',color:colors.navy2},bannerCopy:{fontSize:13,lineHeight:19,color:colors.muted,marginTop:6},routeCard:{width:240,backgroundColor:'#fff',borderRadius:20,padding:20,marginLeft:20,...shadows.md},routeIcon:{width:48,height:48,borderRadius:24,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center',marginBottom:16},routeName:{fontSize:16,fontWeight:'800',color:colors.navy2,lineHeight:22},routeMeta:{fontSize:12,color:colors.muted,marginTop:6},routeFooter:{marginTop:20,paddingTop:14,borderTopWidth:1,borderTopColor:colors.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},steps:{paddingHorizontal:20,flexDirection:'row',justifyContent:'space-between',marginTop:10},step:{width:'22%',alignItems:'center'},stepIcon:{width:52,height:52,borderRadius:26,backgroundColor:colors.white,...shadows.sm,alignItems:'center',justifyContent:'center'},stepNo:{fontSize:11,fontWeight:'900',color:colors.primary,marginTop:12},stepTitle:{fontSize:12,fontWeight:'700',color:colors.navy2,textAlign:'center',marginTop:4,lineHeight:16},safetyTitle:{fontSize:22,fontWeight:'900',color:'#fff',lineHeight:28,marginTop:14},safetyCard: {margin:20,backgroundColor:colors.navy2},stateRoute:{marginLeft:20,paddingHorizontal:16,paddingVertical:12,borderRadius:20,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:8,...shadows.sm},stateRouteText:{fontSize:13,fontWeight:'700',color:colors.navy2},supportRow:{marginHorizontal:20,marginTop:24,padding:16,borderRadius:20,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:14,...shadows.sm},supportIcon:{width:48,height:48,borderRadius:24,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},supportTitle:{fontWeight:'800',color:colors.navy2,fontSize:16},supportCopy:{fontSize:13,color:colors.muted,marginTop:4}, driverHero:{padding:24,backgroundColor:colors.white,borderBottomWidth:1,borderBottomColor:colors.border},driverGreeting:{fontSize:14,color:colors.muted,fontWeight:'600'},driverName:{fontSize:22,fontWeight:'900',color:colors.navy2},onlineToggle:{flexDirection:'row',alignItems:'center',backgroundColor:colors.greenSoft,paddingHorizontal:12,paddingVertical:6,borderRadius:100,gap:6},onlineDot:{width:8,height:8,borderRadius:4,backgroundColor:colors.greenDark},onlineText:{color:colors.greenDark,fontWeight:'700',fontSize:13},driverStatsRow:{flexDirection:'row',gap:12,marginVertical:20},driverStatBox:{flex:1,backgroundColor:colors.bg,padding:16,borderRadius:16},driverStatLabel:{fontSize:12,color:colors.muted,fontWeight:'700',marginBottom:4},driverStatValue:{fontSize:24,fontWeight:'900',color:colors.navy2},driverPrimaryAction:{backgroundColor:colors.primary,borderRadius:100,flexDirection:'row',alignItems:'center',justifyContent:'center',paddingVertical:16,gap:8,...shadows.glow},driverPrimaryActionText:{color:'#fff',fontSize:18,fontWeight:'800'},driverQuickActions:{flexDirection:'row',justifyContent:'space-between',padding:24},quickActionBtn:{alignItems:'center'},quickActionIcon:{width:56,height:56,borderRadius:28,backgroundColor:colors.white,alignItems:'center',justifyContent:'center',marginBottom:8,...shadows.sm},quickActionLabel:{fontSize:12,fontWeight:'600',color:colors.navy2},upcomingRideCard:{margin:20,marginTop:0},upcomingTitle:{fontSize:14,fontWeight:'800',color:colors.muted,textTransform:'uppercase'}});
