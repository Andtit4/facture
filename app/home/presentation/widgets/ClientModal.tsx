import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ClientModal = ({ visible, onClose }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [clients, setClients] = useState([
    {id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '514-123-4567'},
    {id: '2', nom: 'Tremblay', prenom: 'Marie', telephone: '438-555-1234'},
  ]);

  const handleAjouterClient = () => {
    if (nom && prenom && telephone) {
      setClients([...clients, {
        id: Date.now().toString(),
        nom,
        prenom,
        telephone
      }]);
      setNom('');
      setPrenom('');
      setTelephone('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* En-tête du modal */}
          <View style={styles.header}>
            <Text style={styles.title}>Gestion des Clients</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="times" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Formulaire */}
          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom</Text>
              <View style={styles.inputContainer}>
                <Icon name="user" size={18} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez le prénom"
                  value={prenom}
                  onChangeText={setPrenom}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <View style={styles.inputContainer}>
                <Icon name="id-card" size={18} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez le nom"
                  value={nom}
                  onChangeText={setNom}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <View style={styles.inputContainer}>
                <Icon name="phone" size={18} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez le numéro"
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAjouterClient}
            >
              <Icon name="plus-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>Ajouter Client</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Liste des clients */}
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Clients enregistrés</Text>
            
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.clientCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.prenom.charAt(0)}{item.nom.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{item.prenom} {item.nom}</Text>
                    <Text style={styles.clientPhone}>{item.telephone}</Text>
                  </View>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="ellipsis-v" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#1F2937',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 20,
    maxHeight: 250,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 10,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    color: '#1F2937',
    fontSize: 16,
  },
  clientPhone: {
    color: '#6B7280',
    marginTop: 4,
  },
  actionButton: {
    padding: 8,
  },
});

export default ClientModal;