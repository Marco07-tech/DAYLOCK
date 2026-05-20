import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0b0b0b',
  surface: '#141414',
  surface2: '#1c1c1c',
  border: '#252525',
  border2: '#2e2e2e',
  accent: '#b8ff57',
  text: '#f0f0f0',
  muted: '#606060',
  muted2: '#888',
};

const QUOTES = [
  'Pain is temporary. Pride is forever.',
  "The only bad workout is the one that didn't happen.",
  'Discipline is doing what needs to be done.',
  'Sweat is just fat crying.',
  'Champions are made on hard days.',
  'Your body achieves what your mind believes.',
];

const WEEKLY = [45, 60, 30, 75, 50, 90, 40];
const WEEKLY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
const PED_WEEKLY = [8234, 9456, 7123, 10234, 8901, 6543, 7432];

const PLAN = [
  {
    day: 'Mon',
    type: 'Push',
    exs: [
      { n: 'Bench Press', s: 4, r: 8, w: 135, d: false },
      { n: 'Incline DB Press', s: 3, r: 10, w: 40, d: false },
      { n: 'Overhead Press', s: 3, r: 8, w: 95, d: false },
      { n: 'Tricep Dips', s: 3, r: 12, w: 0, d: false },
      { n: 'Lateral Raises', s: 3, r: 15, w: 15, d: false },
    ],
  },
  {
    day: 'Tue',
    type: 'Pull',
    exs: [
      { n: 'Deadlift', s: 4, r: 6, w: 225, d: false },
      { n: 'Pull-ups', s: 4, r: 8, w: 0, d: false },
      { n: 'Barbell Rows', s: 3, r: 10, w: 135, d: false },
      { n: 'Face Pulls', s: 3, r: 15, w: 30, d: false },
      { n: 'Bicep Curls', s: 3, r: 12, w: 25, d: false },
    ],
  },
  {
    day: 'Wed',
    type: 'Legs',
    exs: [
      { n: 'Squats', s: 4, r: 8, w: 185, d: false },
      { n: 'Romanian DL', s: 3, r: 10, w: 155, d: false },
      { n: 'Leg Press', s: 3, r: 12, w: 320, d: false },
      { n: 'Leg Curls', s: 3, r: 15, w: 70, d: false },
      { n: 'Calf Raises', s: 4, r: 20, w: 90, d: false },
    ],
  },
  { day: 'Thu', type: 'Rest', exs: [] },
  {
    day: 'Fri',
    type: 'Push',
    exs: [
      { n: 'Bench Press', s: 4, r: 8, w: 140, d: false },
      { n: 'Incline DB Press', s: 3, r: 10, w: 45, d: false },
      { n: 'Overhead Press', s: 3, r: 8, w: 100, d: false },
      { n: 'Tricep Pushdown', s: 3, r: 12, w: 50, d: false },
    ],
  },
  {
    day: 'Sat',
    type: 'Pull',
    exs: [
      { n: 'Deadlift', s: 4, r: 5, w: 235, d: false },
      { n: 'Pull-ups', s: 4, r: 10, w: 0, d: false },
      { n: 'T-Bar Rows', s: 3, r: 10, w: 120, d: false },
      { n: 'Hammer Curls', s: 3, r: 12, w: 25, d: false },
    ],
  },
  { day: 'Sun', type: 'Rest', exs: [] },
];

function StatCard({ icon, value, unit, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarChart({ data, labels, highlightIdx }) {
  const max = Math.max(...data);
  return (
    <View style={styles.barChart}>
      {data.map((v, i) => {
        const height = (v / max) * 72;
        const isHighlight = i === highlightIdx;
        const isDim = v === 0;
        return (
          <View key={i} style={styles.barWrap}>
            <View
              style={[
                styles.bar,
                { height },
                isHighlight && styles.barToday,
                isDim && styles.barDim,
              ]}
            />
            <Text style={styles.barLbl}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function DashboardScreen() {
  const [workoutActive, setWorkoutActive] = useState(false);
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Text style={styles.greeting}>GOOD EVENING</Text>
        <Text style={styles.version}>fitforge v1.0</Text>
      </View>
      <Text style={styles.screenTitle}>DASHBOARD</Text>
      <Text style={styles.quoteBar}>{randomQuote}</Text>

      <View style={styles.statGrid}>
        <StatCard icon="🔥" value="487" unit="kcal" label="Calories" />
        <StatCard icon="⚡" value="52" unit="min" label="Active" />
        <StatCard icon="👟" value="7,432" unit="steps" label="Today" />
        <StatCard icon="🏆" value="12" unit="days" label="Streak" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>WEEKLY VOLUME</Text>
        <Text style={styles.cardSub}>Minutes per session</Text>
        <BarChart data={WEEKLY} labels={WEEKLY_LABELS} highlightIdx={TODAY_IDX} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TODAY'S WORKOUT</Text>
        <Text style={styles.cardSub}>Push Day — Monday</Text>
        <View style={styles.workoutMeta}>
          <Text style={styles.workoutChip}>5 exercises</Text>
          <Text style={styles.workoutChip}>18 sets</Text>
          <Text style={styles.workoutChip}>~55 min</Text>
        </View>
        <TouchableOpacity
          style={[styles.btnStart, workoutActive && styles.btnStartActive]}
          onPress={() => setWorkoutActive(!workoutActive)}
        >
          <Text style={[styles.btnStartText, workoutActive && styles.btnStartTextActive]}>
            {workoutActive ? '● WORKOUT IN PROGRESS' : '▶ START WORKOUT'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function PlannerScreen() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [plan, setPlan] = useState(PLAN);

  const toggleDay = (idx) => {
    setSelectedDay(selectedDay === idx ? null : idx);
  };

  const toggleEx = (dayIdx, exIdx) => {
    const newPlan = [...plan];
    newPlan[dayIdx].exs[exIdx].d = !newPlan[dayIdx].exs[exIdx].d;
    setPlan(newPlan);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>PLANNER</Text>
      <Text style={{ fontSize: 10, color: COLORS.muted, marginBottom: 16 }}>
        Tap a day to view exercises
      </Text>

      <View style={styles.weekGrid}>
        {plan.map((day, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dayBtn,
              day.type === 'Rest' && styles.dayBtnRest,
              selectedDay === idx && styles.dayBtnActive,
            ]}
            onPress={() => toggleDay(idx)}
          >
            <Text style={styles.dayName}>{day.day.slice(0, 2).toUpperCase()}</Text>
            <Text style={styles.dayType}>{day.type}</Text>
            <Text style={styles.dayCount}>{day.exs.length > 0 ? `${day.exs.length}ex` : '—'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedDay !== null && (
        <View style={styles.exercisePanel}>
          {plan[selectedDay].type === 'Rest' ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>😴</Text>
              <Text style={styles.emptyText}>Rest day. Recovery is part of training.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.exHeader}>
                {plan[selectedDay].day} — {plan[selectedDay].type}
              </Text>
              {plan[selectedDay].exs.map((ex, exIdx) => (
                <View key={exIdx} style={styles.exRow}>
                  <TouchableOpacity
                    style={[styles.exCheck, ex.d && styles.exCheckChecked]}
                    onPress={() => toggleEx(selectedDay, exIdx)}
                  >
                    {ex.d && <Text style={styles.exCheckMark}>✓</Text>}
                  </TouchableOpacity>
                  <View style={styles.exInfo}>
                    <Text style={[styles.exName, ex.d && styles.exNameDone]}>{ex.n}</Text>
                    <Text style={styles.exSets}>
                      {ex.s} sets × {ex.r} reps
                    </Text>
                  </View>
                  <View style={styles.weightWrap}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.muted}
                      defaultValue={ex.w ? ex.w.toString() : ''}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.weightLbl}>kg</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function PedometerScreen() {
  const [steps, setSteps] = useState(7432);
  const [goal, setGoal] = useState(10000);

  const progress = Math.min(steps / goal, 1);
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - progress * circumference;

  const addSteps = (amount) => {
    setSteps(steps + amount);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>PEDOMETER</Text>
      <Text style={styles.quoteBar}>Every step counts. Keep moving.</Text>

      <View style={styles.pedCenter}>
        <View style={styles.pedRingWrap}>
          <View style={[styles.pedInner]}>
            <Text style={styles.pedSteps}>{steps.toLocaleString()}</Text>
            <Text style={styles.pedStepsLbl}>STEPS</Text>
            <Text style={styles.pedPct}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.pedStats}>
        <View style={styles.pedStat}>
          <Text style={styles.pedStatVal}>{(steps * 0.000762).toFixed(2)}</Text>
          <Text style={styles.pedStatUnit}>KM</Text>
          <Text style={styles.pedStatLbl}>Distance</Text>
        </View>
        <View style={[styles.pedStat, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border }]}>
          <Text style={styles.pedStatVal}>{Math.round(steps * 0.04)}</Text>
          <Text style={styles.pedStatUnit}>KCAL</Text>
          <Text style={styles.pedStatLbl}>Burned</Text>
        </View>
        <View style={styles.pedStat}>
          <Text style={styles.pedStatVal}>{Math.round(steps / 100)}</Text>
          <Text style={styles.pedStatUnit}>MIN</Text>
          <Text style={styles.pedStatLbl}>Active</Text>
        </View>
      </View>

      <View style={styles.stepBtns}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => addSteps(500)}>
          <Text style={styles.stepBtnText}>+ 500</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stepBtn} onPress={() => addSteps(1000)}>
          <Text style={styles.stepBtnText}>+ 1000</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalRow}>
        <Text style={styles.goalLbl}>DAILY GOAL</Text>
        <TextInput
          style={styles.goalInput}
          value={goal.toString()}
          onChangeText={(val) => setGoal(parseInt(val) || 10000)}
          keyboardType="number-pad"
        />
        <Text style={styles.goalUnit}>steps</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>WEEKLY TREND</Text>
        <Text style={styles.cardSub}>Steps per day</Text>
        <BarChart data={PED_WEEKLY} labels={WEEKLY_LABELS} highlightIdx={TODAY_IDX} />
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dash');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {activeTab === 'dash' && <DashboardScreen />}
      {activeTab === 'plan' && <PlannerScreen />}
      {activeTab === 'ped' && <PedometerScreen />}

      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'dash' && styles.tabBtnActive]}
          onPress={() => setActiveTab('dash')}
        >
          <View style={[styles.tabIcon, activeTab === 'dash' && styles.tabIconActive]}>
            <Text>⊞</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'dash' && styles.tabLabelActive]}>DASH</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'plan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('plan')}
        >
          <View style={[styles.tabIcon, activeTab === 'plan' && styles.tabIconActive]}>
            <Text>📋</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'plan' && styles.tabLabelActive]}>PLAN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ped' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ped')}
        >
          <View style={[styles.tabIcon, activeTab === 'ped' && styles.tabIconActive]}>
            <Text>👟</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'ped' && styles.tabLabelActive]}>STEPS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  version: {
    fontSize: 10,
    color: COLORS.accent,
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  quoteBar: {
    fontSize: 10,
    color: COLORS.accent,
    lineHeight: 15,
    letterSpacing: 0.3,
    marginBottom: 20,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    minWidth: '48%',
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  statUnit: {
    fontSize: 9,
    color: COLORS.muted2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.text,
  },
  cardSub: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
    marginBottom: 14,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 80,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: COLORS.accent,
    width: '100%',
    minHeight: 3,
  },
  barToday: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  barDim: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border2,
  },
  barLbl: {
    fontSize: 9,
    color: COLORS.muted,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  workoutChip: {
    fontSize: 10,
    color: COLORS.muted2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border2,
  },
  btnStart: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnStartText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.bg,
  },
  btnStartActive: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  btnStartTextActive: {
    color: COLORS.accent,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dayBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 3,
  },
  dayBtnRest: {
    opacity: 0.4,
  },
  dayBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(184,255,87,0.08)',
  },
  dayName: {
    fontSize: 9,
    color: COLORS.muted2,
    letterSpacing: 0.5,
  },
  dayType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
  },
  dayCount: {
    fontSize: 8,
    color: COLORS.muted,
    textAlign: 'center',
  },
  exercisePanel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  exHeader: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exCheck: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exCheckChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  exCheckMark: {
    color: COLORS.bg,
    fontWeight: 'bold',
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  exNameDone: {
    textDecorationLine: 'line-through',
    color: COLORS.muted,
  },
  exSets: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 1,
  },
  weightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  weightInput: {
    backgroundColor: 'transparent',
    color: COLORS.text,
    fontSize: 13,
    width: 44,
    textAlign: 'right',
  },
  weightLbl: {
    fontSize: 9,
    color: COLORS.muted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  pedCenter: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pedRingWrap: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pedInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pedSteps: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.text,
  },
  pedStepsLbl: {
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 3,
    marginTop: 2,
  },
  pedPct: {
    fontSize: 11,
    color: COLORS.accent,
    marginTop: 4,
  },
  pedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    marginBottom: 20,
  },
  pedStat: {
    alignItems: 'center',
    gap: 4,
  },
  pedStatVal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  pedStatUnit: {
    fontSize: 9,
    color: COLORS.accent,
    letterSpacing: 1,
  },
  pedStatLbl: {
    fontSize: 9,
    color: COLORS.muted,
  },
  stepBtns: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.bg,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  goalLbl: {
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1,
    flex: 1,
  },
  goalInput: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 100,
    textAlign: 'right',
  },
  goalUnit: {
    fontSize: 10,
    color: COLORS.muted,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabBtnActive: {},
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  tabIconActive: {
    backgroundColor: COLORS.accent,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    color: COLORS.muted,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
});
