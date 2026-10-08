import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  MoreVertical,
  Sliders,
  ShieldCheck,
  Disc,
  Music,
  ListMusic
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeBoost, setVolumeBoost] = useState(100); // Up to 700%
  const [dspModalVisible, setDspModalVisible] = useState(false);
  
  // DSP Sliders State
  const [antiClipping, setAntiClipping] = useState(true);
  const [noiseGate, setNoiseGate] = useState(true);
  const [bassBoost, setBassBoost] = useState(80);
  const [vocalClarity, setVocalClarity] = useState(65);
  const [hapticBass, setHapticBass] = useState(true);

  // Vinyl Rotation Animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      if (hapticBass) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      spinValue.stopAnimation();
    }
  }, [isPlaying]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* Permission Onboarding Modal */}
      {!permissionGranted && (
        <Modal visible={!permissionGranted} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={['#14161D', '#0A0B0E']} style={styles.permissionCard}>
              <ShieldCheck color="#00FFCC" size={56} style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>تطبيق ياسين الكروان</Text>
              <Text style={styles.modalText}>
                يحتاج التطبيق إذن الوصول لملفات الصوت المحلية لتشغيل أغاني الأوفلاين الخاصة بك بأعلى جودة وبدون إنترنت.
              </Text>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => {
                  setPermissionGranted(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Text style={styles.btnText}>منح إذن الملفات الصوتيـة</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      )}

      {/* Main Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.verifiedBadge}>
            <Text style={{ color: '#0A0B0E', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
          </View>
          <Text style={styles.artistName}>ياسين الكروان | Yassin El-Karawan</Text>
        </View>
        <ListMusic color="#00FFCC" size={24} />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        {/* 3D Vinyl Player Screen */}
        <View style={styles.vinylContainer}>
          <Animated.View style={[styles.vinylDisc, { transform: [{ rotate: spin }] }]}>
            <LinearGradient colors={['#1E2029', '#0A0B0E', '#1E2029']} style={styles.vinylInner}>
              <View style={styles.vinylCenter}>
                <Disc color="#8A2BE2" size={40} />
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Track Details */}
        <Text style={styles.trackTitle}>حصريات الكروان - أوفلاين 2026</Text>
        <Text style={styles.trackArtist}>ياسين الكروان (صوت فائق الجودة)</Text>

        {/* Waveform Visualizer Placeholder */}
        <View style={styles.waveformContainer}>
          {[40, 70, 30, 90, 100, 60, 80, 40, 95, 50, 85, 30, 60, 90, 45].map((height, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                { height: isPlaying ? height * 0.4 : 10, backgroundColor: i % 2 === 0 ? '#00FFCC' : '#8A2BE2' }
              ]}
            />
          ))}
        </View>

        {/* Volume & DSP Controls */}
        <View style={styles.volumeControlCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-[#00FFCC]', alignItems: 'center', width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Volume2 color="#00FFCC" size={20} />
              <Text style={styles.volumeText}>مستوى الصوت المفرط: {volumeBoost}%</Text>
            </View>

            <TouchableOpacity onPress={() => setDspModalVisible(true)} style={styles.dspButton}>
              <MoreVertical color="#00FFCC" size={20} />
            </TouchableOpacity>
          </View>

          {/* Quick Boost Selector */}
          <View style={styles.boostRow}>
            {[100, 200, 400, 700].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.boostChip, volumeBoost === val && styles.boostChipActive]}
                onPress={() => {
                  setVolumeBoost(val);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.boostChipText, volumeBoost === val && { color: '#0A0B0E' }]}>{val}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <SkipBack color="#FFFFFF" size={32} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <LinearGradient colors={['#00FFCC', '#8A2BE2']} style={styles.playBtnGradient}>
              {isPlaying ? <Pause color="#0A0B0E" size={32} /> : <Play color="#0A0B0E" size={32} style={{ marginLeft: 4 }} />}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <SkipForward color="#FFFFFF" size={32} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DSP Noise & EQ Control Modal */}
      <Modal visible={dspModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.dspCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Sliders color="#00FFCC" size={24} />
                <Text style={styles.dspTitle}>لوحة معالجة الصوت DSP</Text>
              </View>
              <TouchableOpacity onPress={() => setDspModalVisible(false)}>
                <Text style={{ color: '#FF2B2B', fontSize: 16, fontWeight: 'bold' }}>إغلاق</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dspOption}>
              <Text style={styles.dspOptionLabel}>مانع التشويه (Anti-Clipping Limiter):</Text>

              <TouchableOpacity
                style={[styles.toggleBtn, antiClipping && styles.toggleBtnActive]}
                onPress={() => setAntiClipping(!antiClipping)}
              >
                <Text style={{ color: antiClipping ? '#0A0B0E' : '#FFF', fontWeight: 'bold' }}>
                  {antiClipping ? 'مفعل (700%)' : 'معطل'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dspOption}>
              <Text style={styles.dspOptionLabel}>مانع الضوضاء والفيز (Noise Gate):</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, noiseGate && styles.toggleBtnActive]}
                onPress={() => setNoiseGate(!noiseGate)}
              >
                <Text style={{ color: noiseGate ? '#0A0B0E' : '#FFF', fontWeight: 'bold' }}>
                  {noiseGate ? 'مفعل' : 'معطل'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dspOption}>
              <Text style={styles.dspOptionLabel}>اهتزاز الباس (Haptic Bass drops):</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, hapticBass && styles.toggleBtnActive]}
                onPress={() => setHapticBass(!hapticBass)}
              >
                <Text style={{ color: hapticBass ? '#0A0B0E' : '#FFF', fontWeight: 'bold' }}>
                  {hapticBass ? 'مفعل' : 'معطل'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  artistName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  verifiedBadge: { backgroundColor: '#00FFCC', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  vinylContainer: { marginTop: 20, marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
  vinylDisc: { width: width * 0.7, height: width * 0.7, borderRadius: (width * 0.7) / 2, backgroundColor: '#111', borderWidth: 4, borderColor: '#00FFCC', justifyContent: 'center', alignItems: 'center' },
  vinylInner: { width: '85%', height: '85%', borderRadius: 1000, justifyContent: 'center', alignItems: 'center' },
  vinylCenter: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0A0B0E', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#8A2BE2' },
  trackTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  trackArtist: { color: '#00FFCC', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', height: 45, gap: 4, marginBottom: 25 },
  waveBar: { width: 5, borderRadius: 3 },
  volumeControlCard: { width: '90%', backgroundColor: '#14161D', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1E2029', marginBottom: 25 },
  volumeText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  dspButton: { padding: 6, backgroundColor: '#1E2029', borderRadius: 10 },
  boostRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 12 },
  boostChip: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#1E2029' },
  boostChipActive: { backgroundColor: '#00FFCC' },
  boostChipText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 36 },
  playBtn: { width: 70, height: 70, borderRadius: 35, overflow: 'hidden' },
  playBtnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionCard: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#00FFCC' },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  modalText: { color: '#A0A5B5', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btnPrimary: { backgroundColor: '#00FFCC', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#0A0B0E', fontSize: 16, fontWeight: 'bold' },
  dspCard: { width: '100%', backgroundColor: '#14161D', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#8A2BE2' },
  dspTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  dspOption: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  dspOptionLabel: { color: '#A0A5B5', fontSize: 13, flex: 1, textAlign: 'right' },
  toggleBtn: { backgroundColor: '#1E2029', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: '#00FFCC' }
});
