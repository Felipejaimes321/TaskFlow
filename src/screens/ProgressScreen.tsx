import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/context/authStore';
import { useTaskStore } from '@/context/taskStore';
import { useTheme } from '@/context/themeContext';
import ProgressRing from '@/components/ProgressRing';

const { width } = Dimensions.get('window');

function getStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  // Normalizar fechas a zona local (YYYY-MM-DD)
  const uniqueDates = Array.from(new Set(dates.map(d => d.slice(0, 10)))).sort().reverse();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0; // Se perdió la racha
  }

  let streak = 1;
  let currentDate = new Date(uniqueDates[0] + 'T00:00:00');

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i] + 'T00:00:00');
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const { colors, isDark } = useTheme();

  const stats = useMemo(() => {
    let completedTasks = 0;
    let completedSubtasks = 0;
    const completionDates: string[] = [];

    const todayStr = new Date().toISOString().slice(0, 10);
    let dueToday = 0;
    let doneToday = 0;

    tasks.forEach(t => {
      // XP & Streaks
      if (t.status === 'completed' && t.completed_at) {
        completedTasks++;
        completionDates.push(t.completed_at);
        if (t.completed_at.slice(0, 10) === todayStr) {
          doneToday++;
        }
      }

      // Subtasks XP
      if (t.subtasks) {
        t.subtasks.forEach(s => {
          if (s.completed) completedSubtasks++;
        });
      }

      // Daily Ring (Tasks due today)
      if (t.due_date?.slice(0, 10) === todayStr) {
        dueToday++;
        // Si no está completada pero estaba programada para hoy, cuenta en el total.
        // Si ya está completada hoy, ya la contamos en doneToday.
        // Pero si se completó OTRO día, no cuenta para el progreso de hoy.
      }
    });

    // Calcular el total de tareas esperadas para hoy
    // Son todas las que tenían fecha de hoy, más cualquier tarea sin fecha (o fecha pasada) que se completó hoy.
    const totalTodayPool = new Set();
    tasks.forEach(t => {
      if (t.due_date?.slice(0, 10) === todayStr) totalTodayPool.add(t.id);
      if (t.completed_at?.slice(0, 10) === todayStr) totalTodayPool.add(t.id);
    });

    const expectedToday = totalTodayPool.size;
    const dailyProgress = expectedToday === 0 ? 1 : doneToday / expectedToday;

    const totalXP = (completedTasks * 50) + (completedSubtasks * 10);
    const level = Math.floor(totalXP / 500) + 1;
    const xpProgress = totalXP % 500;
    const streak = getStreak(completionDates);

    return {
      totalXP,
      level,
      xpProgress,
      streak,
      dailyProgress,
      completedTasks,
      doneToday,
      expectedToday
    };
  }, [tasks]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Text style={[styles.title, { color: colors.text }]}>Tu Progreso</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Jugador Card (Level & XP) */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.playerTop}>
            <View style={[styles.avatarBox, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerName, { color: colors.text }]}>{user?.full_name}</Text>
              <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="star" size={10} color="#FFF" />
                <Text style={styles.levelText}>Nivel {stats.level}</Text>
              </View>
            </View>
            <View style={styles.xpBox}>
              <Text style={[styles.xpText, { color: colors.primary }]}>{stats.totalXP} XP</Text>
            </View>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${(stats.xpProgress / 500) * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{stats.xpProgress} XP</Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Siguiente: 500 XP</Text>
          </View>
        </View>

        {/* Highlight Row */}
        <View style={styles.row}>
          {/* Daily Ring */}
          <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Hoy</Text>
            <View style={styles.ringWrapper}>
              <ProgressRing progress={stats.dailyProgress} size={100} strokeWidth={9} showPercent />
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {stats.doneToday} de {stats.expectedToday === 0 ? '0' : stats.expectedToday} tareas
            </Text>
          </View>

          {/* Streak */}
          <View style={[styles.card, styles.halfCard, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
            <View style={[styles.flameCircle, { backgroundColor: stats.streak > 0 ? colors.warning + '20' : colors.surfaceAlt }]}>
              <Ionicons name="flame" size={48} color={stats.streak > 0 ? colors.warning : colors.icon} />
            </View>
            <Text style={[styles.streakNum, { color: colors.text }]}>{stats.streak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Días seguidos</Text>
          </View>
        </View>

        {/* Global Stats */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Estadísticas Históricas</Text>
        <View style={[styles.statsGrid, { backgroundColor: colors.surface }]}>
          <View style={[styles.statCell, { borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderSubtle }]}>
            <Ionicons name="checkmark-done" size={24} color={colors.success} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.completedTasks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tareas Completadas</Text>
          </View>
          <View style={[styles.statCell, { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderSubtle }]}>
            <Ionicons name="trophy-outline" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.level}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Nivel Alcanzado</Text>
          </View>
          <View style={[styles.statCell, { borderRightWidth: StyleSheet.hairlineWidth, borderColor: colors.borderSubtle }]}>
            <Ionicons name="flash-outline" size={24} color={colors.warning} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalXP}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total XP</Text>
          </View>
          <View style={styles.statCell}>
            <Ionicons name="calendar-outline" size={24} color={colors.textTertiary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.text }]}>{tasks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tareas Creadas</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 16, paddingBottom: 100 },
  card: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  row: { flexDirection: 'row', gap: 16 },
  halfCard: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  ringWrapper: { alignItems: 'center', marginVertical: 8 },
  cardSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  flameCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  streakNum: { fontSize: 32, fontWeight: '800' },
  streakLabel: { fontSize: 14, fontWeight: '600' },
  playerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 22, fontWeight: '800' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  levelBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#FFF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  xpBox: { alignItems: 'flex-end' },
  xpText: { fontSize: 18, fontWeight: '800' },
  progressBarBg: { height: 8, borderRadius: 4, backgroundColor: '#E5E5EA', overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8, marginLeft: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  statCell: { width: '50%', padding: 20, alignItems: 'center' },
  statIcon: { marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500' },
});
