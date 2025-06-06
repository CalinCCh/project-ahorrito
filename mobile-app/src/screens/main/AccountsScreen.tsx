import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/redux';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  isConnected: boolean;
}

interface AccountCardProps {
  account: Account;
  onPress: () => void;
}

function AccountCard({ account, onPress }: AccountCardProps) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return 'card';
      case 'savings': return 'wallet';
      case 'credit': return 'card-outline';
      case 'investment': return 'trending-up';
      default: return 'card';
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return ['#3B82F6', '#1D4ED8'];
      case 'savings': return ['#10B981', '#059669'];
      case 'credit': return ['#F59E0B', '#D97706'];
      case 'investment': return ['#8B5CF6', '#7C3AED'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const getAccountType = (type: string) => {
    switch (type) {
      case 'checking': return 'Cuenta Corriente';
      case 'savings': return 'Cuenta de Ahorro';
      case 'credit': return 'Tarjeta de Crédito';
      case 'investment': return 'Inversión';
      default: return 'Cuenta';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.accountCard}>
      <LinearGradient
        colors={getAccountColor(account.type)}
        style={styles.accountGradient}
      >
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountType}>{getAccountType(account.type)}</Text>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.bankName}>{account.bankName}</Text>
          </View>
          <View style={styles.accountIconContainer}>
            <Ionicons 
              name={getAccountIcon(account.type) as any} 
              size={32} 
              color="#FFFFFF" 
            />
          </View>
        </View>

        <View style={styles.accountBalance}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>
            {account.currency}{account.balance.toLocaleString('es-ES', { 
              minimumFractionDigits: 2 
            })}
          </Text>
        </View>

        <View style={styles.accountFooter}>
          <Text style={styles.accountNumber}>
            •••• •••• •••• {account.accountNumber.slice(-4)}
          </Text>
          <View style={[
            styles.connectionStatus,
            { backgroundColor: account.isConnected ? '#10B981' : '#EF4444' }
          ]}>
            <Ionicons 
              name={account.isConnected ? "checkmark-circle" : "alert-circle"} 
              size={12} 
              color="#FFFFFF" 
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function AccountsScreen() {
  const mockAccounts: Account[] = [
    {
      id: '1',
      name: 'Mi Cuenta Principal',
      type: 'checking',
      balance: 3450.75,
      currency: '€',
      bankName: 'Banco Santander',
      accountNumber: '1234567890123456',
      isConnected: true,
    },
    {
      id: '2',
      name: 'Ahorros Vacaciones',
      type: 'savings',
      balance: 1250.00,
      currency: '€',
      bankName: 'BBVA',
      accountNumber: '9876543210987654',
      isConnected: true,
    },
    {
      id: '3',
      name: 'Tarjeta Crédito',
      type: 'credit',
      balance: -567.89,
      currency: '€',
      bankName: 'CaixaBank',
      accountNumber: '5555444433332222',
      isConnected: false,
    },
    {
      id: '4',
      name: 'Cartera Inversión',
      type: 'investment',
      balance: 8750.25,
      currency: '€',
      bankName: 'ING Direct',
      accountNumber: '1111222233334444',
      isConnected: true,
    },
  ];

  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cuentas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {}}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View style={styles.totalBalanceContainer}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.totalBalanceCard}
        >
          <View style={styles.totalBalanceHeader}>
            <Text style={styles.totalBalanceLabel}>Balance Total</Text>
            <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.totalBalanceAmount}>
            €{totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.totalBalanceFooter}>
            <Text style={styles.accountsCount}>
              {mockAccounts.length} cuenta{mockAccounts.length !== 1 ? 's' : ''} conectada{mockAccounts.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.trendText}>+2.5%</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Accounts List */}
      <View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>Todas las Cuentas</Text>
        <FlatList
          data={mockAccounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AccountCard
              account={item}
              onPress={() => {
                // Navegar a detalles de cuenta
                console.log('Account pressed:', item.name);
              }}
            />
          )}
          contentContainerStyle={styles.accountsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Conectar Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="sync" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Sincronizar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="analytics" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Análisis</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: '#3B82F6',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalBalanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  totalBalanceCard: {
    borderRadius: 20,
    padding: 24,
  },
  totalBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  totalBalanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  totalBalanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountsCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  accountsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  accountsList: {
    paddingBottom: 20,
  },
  accountCard: {
    marginBottom: 16,
  },
  accountGradient: {
    borderRadius: 16,
    padding: 20,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bankName: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountBalance: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountNumber: {
    fontSize: 14,
    color: '#E0E7FF',
    fontFamily: 'monospace',
  },
  connectionStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickAction: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
});