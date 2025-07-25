// App.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { HomeApi } from '../infrastructure/HomeApi';
import User from '@/app/login/domain/entities/User';

const { width } = Dimensions.get('window');

// Composant d'icône simple pour remplacer Lucide
const Icon = ({ name, size = 24, color = '#000' }) => {
  const icons = {
    'dollar-sign': '$',
    'file-text': '📄',
    'users': '👥',
    'credit-card': '💳',
    'plus': '+',
    'bell': '🔔',
    'search': '🔍',
    'settings': '⚙️',
    'chevron-right': '›',
    'bar-chart': '📊',
    'shopping-cart': '🛒',
  };
  
  return (
    <Text style={{ fontSize: size, color, textAlign: 'center' }}>
      {icons[name] || '•'}
    </Text>
  );
};

export default function BillingApp() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    setIsLoaded(true);
    HomeApi.getCurrentUser().then(setCurrentUser);
  }, []);

  const stats = [
    { 
      icon: 'dollar-sign', 
      label: 'Revenus ce mois', 
      value: '€12,450', 
      change: '+12%', 
      color: '#10b981' 
    },
    { 
      icon: 'file-text', 
      label: 'Factures créées', 
      value: '156', 
      change: '+8%', 
      color: '#3b82f6' 
    },
    { 
      icon: 'users', 
      label: 'Clients actifs', 
      value: '89', 
      change: '+15%', 
      color: '#8b5cf6' 
    },
    { 
      icon: 'credit-card', 
      label: 'Paiements reçus', 
      value: '142', 
      change: '+5%', 
      color: '#f59e0b' 
    }
  ];

  const quickActions = [
    { icon: 'plus', label: 'Nouvelle facture', color: '#6366f1' },
    { icon: 'users', label: 'Ajouter client', color: '#ec4899' },
    { icon: 'shopping-cart', label: 'Gérer produits', color: '#10b981' },
    { icon: 'bar-chart', label: 'Analytics', color: '#f59e0b' }
  ];

  const recentInvoices = [
    { id: 'INV-001', client: 'Entreprise ABC', amount: '€1,250', status: 'payée', date: '25 Jul' },
    { id: 'INV-002', client: 'Studio XYZ', amount: '€850', status: 'en attente', date: '24 Jul' },
    { id: 'INV-003', client: 'Société DEF', amount: '€2,100', status: 'brouillon', date: '23 Jul' }
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'payée': 
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'en attente': 
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'brouillon': 
        return { backgroundColor: '#f3f4f6', color: '#374151' };
      default: 
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const StatCard = ({ stat, index }) => {
    const [cardAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            opacity: cardAnim,
            transform: [{
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity style={styles.statCardContent}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
              <Icon name={stat.icon} size={20} color="white" />
            </View>
            <Text style={styles.statChange}>{stat.change}</Text>
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const QuickActionButton = ({ action, index }) => (
    <TouchableOpacity style={styles.quickActionButton}>
      <View style={[styles.quickActionContent, { backgroundColor: action.color }]}>
        <Icon name={action.icon} size={28} color="white" />
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.gradient}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>FacturePro</Text>
              <Text style={styles.subtitle}>Tableau de bord</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.searchContainer}>
                <Icon name="search" size={16} color="#9ca3af" />
                <TextInput
                  placeholder="Rechercher..."
                  style={styles.searchInput}
                  placeholderTextColor="#9ca3af"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                AsyncStorage.setItem('token', '').then(() => {
                    router.replace('/login/presentation/Login');
                })
              }} style={styles.notificationButton}>
                <Icon name="bell" size={20} color="#6b7280" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <Animated.View
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>Bonjour ! {currentUser?.username} 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Voici un aperçu de votre activité aujourd'hui
            </Text>
          </Animated.View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </View>

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.quickActionsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <QuickActionButton key={action.label} action={action} index={index} />
              ))}
            </View>
          </Animated.View>

          {/* Recent Invoices */}
          <Animated.View
            style={[
              styles.invoicesSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.invoicesCard}>
              <View style={styles.invoicesHeader}>
                <Text style={styles.sectionTitle}>Factures récentes</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllButton}>Voir tout</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.invoicesList}>
                {recentInvoices.map((invoice, index) => (
                  <TouchableOpacity key={invoice.id} style={styles.invoiceItem}>
                    <View style={styles.invoiceLeft}>
                      <View style={styles.invoiceIcon}>
                        <Icon name="file-text" size={16} color="white" />
                      </View>
                      <View>
                        <Text style={styles.invoiceId}>{invoice.id}</Text>
                        <Text style={styles.invoiceClient}>{invoice.client}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.invoiceRight}>
                      <View style={styles.invoiceAmountContainer}>
                        <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
                        <Text style={styles.invoiceDate}>{invoice.date}</Text>
                      </View>
                      <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                        <Text style={[styles.statusText, { color: getStatusStyle(invoice.status).color }]}>
                          {invoice.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Chart Preview */}
          <Animated.View
            style={[
              styles.chartSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Aperçu des revenus</Text>
              <View style={styles.chartContainer}>
                <View style={styles.chartBars}>
                  {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.chartBar,
                        { 
                          height: `${height}%`,
                          opacity: fadeAnim,
                        }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
              <Icon name="bar-chart" size={20} color="#6366f1" />
              <Text style={[styles.navText, styles.navTextActive]}>Accueil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Icon name="file-text" size={20} color="#9ca3af" />
              <Text style={styles.navText}>Factures</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Icon name="users" size={20} color="#9ca3af" />
              <Text style={styles.navText}>Clients</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Icon name="settings" size={20} color="#9ca3af" />
              <Text style={styles.navText}>Profil</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 140,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
  },
  statCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: (width - 52) / 2,
  },
  quickActionContent: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  invoicesSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  invoicesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  invoicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  seeAllButton: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  invoicesList: {
    padding: 20,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#6366f1',
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  invoiceClient: {
    fontSize: 14,
    color: '#6b7280',
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmountContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartContainer: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  chartBar: {
    width: 8,
    backgroundColor: '#6366f1',
    borderRadius: 4,
    minHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    // Style actif
  },
  navText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  navTextActive: {
    color: '#6366f1',
  },
});