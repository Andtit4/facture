import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Product } from '../../domain/model/Product';
import { HomeApi } from '../../infrastructure/HomeApi';

const ProductModal = ({ visible, onClose, products, setProducts }) => {
    const [nom, setNom] = useState('');
    const [amount, setAmount] = useState('');
    const [productList, setProductList] = useState([]);

    const handleAjouterProduit = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (nom.trim() && amount.trim()) {
            try {
                const product = new Product(Math.random(), nom, parseFloat(amount), new Date());
                const newProduit = await HomeApi.createProduct(product);
                setProductList([...productList, newProduit]);
                
                setNom('');
                setAmount('');
            }
            catch (error) {
                console.error('Erreur lors de l\'ajout du produit:', error);
            }
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await HomeApi.getProducts();
                setProductList(response || []); // S'assurer que response n'est pas null/undefined
                // console.log('Produits récupérés:', product);
            } catch (error) {
                console.error('Erreur lors de la récupération des produits:', error);
                setProductList([]);
            }
        };
        
        if (visible) { 
            fetchProducts();
        }
    }, [visible]);

    const renderProductItem = ({ item }) => {
        if (!item) return null;
        
        const productName = item.product_name || item.nom || 'Produit sans nom';
        const productAmount = item.product_amount || item.amount || 0;
        const dateAdd = item.date_add || 'Date inconnue';
        
        return (
            <View style={styles.productCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {productName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{productName}</Text>
                    <Text style={styles.productAmount}>{productAmount}€</Text>
                    <Text style={styles.productDate}>Ajouté le {dateAdd ? new Date(dateAdd).toLocaleDateString('fr-FR') : ''}</Text>
                </View>
                <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome name="ellipsis-v" size={18} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        );
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
                        <Text style={styles.title}>Gestion des Produits</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <FontAwesome name="times" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Formulaire */}
                    <ScrollView style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nom du produit</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="cube" size={18} color="#9CA3AF" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Entrez le nom du produit"
                                    value={nom}
                                    onChangeText={setNom}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Montant</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="dollar" size={18} color="#9CA3AF" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Entrez le montant"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAjouterProduit}
                        >
                            <FontAwesome name="plus-circle" size={20} color="white" />
                            <Text style={styles.addButtonText}>Ajouter Produit</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Liste des produits */}
                    <View style={styles.listContainer}>
                        <Text style={styles.sectionTitle}>Produits enregistrés</Text>

                        <FlatList
                            data={productList}
                            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                            renderItem={renderProductItem}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>Aucun produit enregistré</Text>
                                </View>
                            }
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
        backgroundColor: '#10B981',
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
    productCard: {
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
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 16,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontWeight: '600',
        color: '#1F2937',
        fontSize: 16,
    },
    productAmount: {
        color: '#10B981',
        fontWeight: '600',
        marginTop: 2,
        fontSize: 14,
    },
    productDate: {
        color: '#6B7280',
        marginTop: 2,
        fontSize: 12,
    },
    actionButton: {
        padding: 8,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default ProductModal;