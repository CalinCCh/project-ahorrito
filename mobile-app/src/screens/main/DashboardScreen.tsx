import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';

const { width } = Dimensions.get('window');

interface BalanceCardProps {
  title: string;
  amount: number;
  currency: string;
  trend?: number;
  color: string[];
  icon: string;
}

function BalanceCard({ title, amount, currency, trend, color, icon }: BalanceCardProps) {
  return (
    <LinearGradient colors={color} style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceTitle}>{title}</Text>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.balanceAmount}>
        {currency}{amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
      </Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trend >= 0 ? "trending-up" : "trending-down"} 
            size={16} 
            color={trend >= 0 ? "#10B981" : "#EF4444"} 
          />
          <Text style={[styles.trendText, { color: trend >= 0 ? "#10B981" : "#EF4444" }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

interface QuickActionProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function QuickAction({ title, icon, color, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );
}

interface RecentTransactionProps {
  payee: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

function RecentTransaction({ payee, amount, date, category, type }: RecentTransactionProps) {
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: type === 'income' ? '#DCFCE7' : '#FEE2E2' }
        ]}>
          <Ionicons 
            name={type === 'income' ? "arrow-down" : "arrow-up"} 
            size={16} 
            color={type === 'income' ? "#16A34A" : "#DC2626"} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionPayee}>{payee}</Text>
          <Text style={styles.transactionCategory}>{category}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: type === 'income' ? '#16A34A' : '#DC2626' }
        ]}>
          {type === 'income' ? '+' : '-'}€{Math.abs(amount).toFixed(2)}
        </Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const mockTransactions = [
    { payee: 'Supermercado XYZ', amount: -45.67, date: 'Hoy', category: 'Alimentación', type: 'expense' as const },
    { payee: 'Salario', amount: 2500.00, date: 'Ayer', category: 'Ingresos', type: 'income' as const },
    { payee: 'Netflix', amount: -12.99, date: '2 días', category: 'Entretenimiento', type: 'expense' as const },
    { payee: 'Transferencia', amount: 100.00, date: '3 días', category: 'Transferencias', type: 'income' as const },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga de datos
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, {user?.firstName}!</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#3B82F6" />
            {user?.isVip && (
              <View style={styles.vipBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <BalanceCard
            title="Balance Total"
            amount={5432.10}
            currency="€"
            trend={2.5}
            color={['#3B82F6', '#1D4ED8']}
            icon="wallet"
          />
          <View style={styles.balanceRow}>
            <BalanceCard
              title="Ingresos"
              amount={3200.00}
              currency="€"
              color={['#10B981', '#059669']}
              icon="trending-up"
            />
            <BalanceCard
              title="Gastos"
              amount={1567.90}
              currency="€"
              color={['#EF4444', '#DC2626']}
              icon="trending-down"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <QuickAction
              title="Transferir"
              icon="swap-horizontal"
              color="#3B82F6"
              onPress={() => {}}
            />
            <QuickAction
              title="Agregar"
              icon="add-circle"
              color="#10B981"
              onPress={() => {}}
            />
            <QuickAction
              title="Pagar"
              icon="card"
              color="#F59E0B"
              onPress={() => {}}
            />
            <QuickAction
              title="Más"
              icon="ellipsis-horizontal"
              color="#8B5CF6"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsContainer}>
            {mockTransactions.map((transaction, index) => (
              <RecentTransaction
                key={index}
                payee={transaction.payee}
                amount={transaction.amount}
                date={transaction.date}
                category={transaction.category}
                type={transaction.type}
              />
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos de Ahorro</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Vacaciones de Verano</Text>
              <Text style={styles.goalProgress}>75%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.goalAmount}>€1,500 de €2,000</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  profileButton: {
    position: 'relative',
  },
  vipBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionPayee: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  goalAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
});